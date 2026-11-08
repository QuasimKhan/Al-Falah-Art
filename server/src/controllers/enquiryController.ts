import { Request, Response, NextFunction } from 'express';
import Customer from '../models/Customer';
import Enquiry from '../models/Enquiry';
import Product from '../models/Product';
import Settings from '../models/Settings';
import Offer from '../models/Offer';
import { AppError } from '../utils/AppError';
import mongoose from 'mongoose';

// Internal helper to calculate price authoritatively 
const calculateExactPrice = async (productId: string, quantity: number, deliveryMode: string, offerCode?: string) => {

    // 1. Validate ObjectId to prevent CastErrors
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new AppError('Invalid Product ID format', 400);
    }
    const product = await Product.findById(productId);
    if (!product) throw new AppError('Product not found', 404);
    if (!product.isActive) throw new AppError('Product is currently unavailable', 400);

    const applicableSlab = product.pricingSlabs.find(
        (slab) => quantity >= slab.minQty && (slab.maxQty === null || quantity <= slab.maxQty)
    );

    if (!applicableSlab) {
        throw new AppError(`No pricing configured for quantity: ${quantity}`, 400);
    }

    const unitPrice = applicableSlab.pricePerUnit;
    const subtotal = unitPrice * quantity;

    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({}); // Fallback to defaults if admin hasn't configured yet
    }

    const deliveryCharge = deliveryMode === 'Delivery' ? settings.deliveryCharge : 0;

    let discount = 0;
    if (offerCode) {
        const offer = await Offer.findOne({
            code: offerCode.toUpperCase(),
            isActive: true,
            validFrom: { $lte: new Date() },
            validUntil: { $gte: new Date() }
        });

        if (offer) {
            if (offer.discountType === 'fixed') {
                discount = Math.min(offer.discountValue, subtotal);
            } else {
                discount = (subtotal * offer.discountValue) / 100;
            }
        }
    }

    const baseAmount = subtotal - discount;
    let platformFee = 0;
    if (settings.platformFeeType === 'fixed') {
        platformFee = settings.platformFeeValue;
    } else if (settings.platformFeeType === 'percentage') {
        platformFee = (baseAmount * settings.platformFeeValue) / 100;
    }

    const totalPayable = baseAmount + deliveryCharge + platformFee;
    const advanceRequired = (totalPayable * settings.advancePaymentPercentage) / 100;

    return {
        unitPrice,
        subtotal,
        discount,
        deliveryCharge,
        platformFee,
        totalPayable,
        advanceRequired
    };
};

// Endpoint: POST /api/v1/enquiries/calculate-price
// Called by the frontend when the user changes quantity/delivery options
export const getPriceEstimate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productId, quantity, deliveryMode, offerCode } = req.body;

        if (!productId || !quantity || !deliveryMode) {
            return next(new AppError('Product ID, quantity, and delivery mode are required', 400));
        }

        const pricing = await calculateExactPrice(productId, Number(quantity), deliveryMode, offerCode);

        res.status(200).json({
            success: true,
            data: pricing
        });
    } catch (error) {
        next(error);
    }
};

// Endpoint: POST /api/v1/enquiries
// Called when the customer finally submits the form
export const submitEnquiry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            name, phone, email,
            type, productId, designId,
            quantity, deliveryMode, offerCode,
            formData
        } = req.body;

        if (!productId || !quantity || !deliveryMode) {
            return next(new AppError('Missing required product or pricing selection', 400));
        }

        // 1. Authoritative Backend Recalculation (Ignores frontend price completely)
        const pricingSnapshot = await calculateExactPrice(productId, Number(quantity), deliveryMode, offerCode);

        // 2. Find or create customer
        let customer = await Customer.findOne({ phone });
        if (!customer) {
            customer = await Customer.create({ name, phone, email });
        }

        // 3. Process Cloudinary attachments if any
        const attachments = req.files
            ? (req.files as Express.Multer.File[]).map(file => file.path)
            : [];

        // 4. Parse dynamic form data safely
        const parsedFormData = typeof formData === 'string' ? JSON.parse(formData) : formData;

        // 5. Create Enquiry with the financial snapshot securely attached
        const enquiry = await Enquiry.create({
            customerId: customer._id,
            productId,
            designId: designId || undefined,
            type,
            quantity: Number(quantity),
            deliveryMode,
            pricingSnapshot,
            formData: parsedFormData,
            attachments,
            status: 'Submitted'
        });

        res.status(201).json({
            success: true,
            message: 'Enquiry submitted successfully',
            trackingToken: enquiry.trackingToken
        });
    } catch (error) {
        next(error);
    }
};


export const getAdminEnquiries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Fetch latest enquiries, populate customer and product data
        const enquiries = await Enquiry.find({})
            .populate('customerId', 'name phone')
            .populate('productId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: enquiries });
    } catch (error) {
        next(error);
    }
};



// Endpoint: GET /api/v1/enquiries/:id
// Admin fetches full details of a single enquiry
export const getAdminEnquiryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const enquiry = await Enquiry.findById(req.params.id)
            .populate('customerId')
            .populate('productId');

        if (!enquiry) return next(new AppError('Enquiry not found', 404));

        res.status(200).json({ success: true, data: enquiry });
    } catch (error) {
        next(error);
    }
};

// Endpoint: PATCH /api/v1/enquiries/:id/proof
// Admin uploads a design proof and updates status
export const uploadDesignProof = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const enquiry = await Enquiry.findById(req.params.id);
        if (!enquiry) return next(new AppError('Enquiry not found', 404));

        if (!req.file) return next(new AppError('Please upload a proof image file', 400));

        enquiry.designProofUrl = req.file.path; // Cloudinary URL
        enquiry.adminNotes = req.body.adminNotes || '';
        enquiry.status = 'Content/Design Approved'; // Moving to approval stage

        await enquiry.save();

        res.status(200).json({ success: true, data: enquiry });
    } catch (error) {
        next(error);
    }
};

// Endpoint: GET /api/v1/enquiries/track/:trackingToken
// Public endpoint for customer to view their order status
export const trackEnquiry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const enquiry = await Enquiry.findOne({ trackingToken: req.params.trackingToken })
            .populate('productId', 'name')
            .select('-customerId'); // Hide customer ID for public link security, but keep order data

        if (!enquiry) return next(new AppError('Invalid tracking token', 404));

        res.status(200).json({ success: true, data: enquiry });
    } catch (error) {
        next(error);
    }
};

// Endpoint: PATCH /api/v1/enquiries/track/:trackingToken/approve
// Customer approves the design, moving it to Awaiting Payment
export const approveDesignByCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const enquiry = await Enquiry.findOne({ trackingToken: req.params.trackingToken });
        if (!enquiry) return next(new AppError('Invalid tracking token', 404));

        if (enquiry.status !== 'Content/Design Approved') {
            return next(new AppError('Design is not in an approvable state', 400));
        }

        enquiry.status = 'Awaiting Payment';
        await enquiry.save();

        res.status(200).json({ success: true, message: 'Design approved successfully', data: enquiry });
    } catch (error) {
        next(error);
    }
};