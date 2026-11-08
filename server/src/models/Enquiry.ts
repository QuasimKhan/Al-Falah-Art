import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IPricingSnapshot {
    unitPrice: number;
    subtotal: number;
    discount: number;
    deliveryCharge: number;
    platformFee: number;
    totalPayable: number;
    advanceRequired: number;
}

export interface IEnquiry extends Document {
    customerId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    designId?: mongoose.Types.ObjectId;
    type: 'Wedding Card' | 'Poster/Banner' | 'General';

    // Order specifics
    quantity: number;
    deliveryMode: 'Pickup' | 'Delivery';
    pricingSnapshot: IPricingSnapshot;

    // Content
    formData: any;
    attachments: string[];
    adminNotes?: string;
    designProofUrl?: string; // Uploaded by admin for approval

    status: string;
    trackingToken: string;
}

const EnquirySchema = new Schema({
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    designId: { type: Schema.Types.ObjectId, ref: 'DesignSample' },
    type: { type: String, enum: ['Wedding Card', 'Poster/Banner', 'General'], required: true },

    quantity: { type: Number, required: true, min: 1 },
    deliveryMode: { type: String, enum: ['Pickup', 'Delivery'], required: true },

    // Snapshot ensures historical integrity
    pricingSnapshot: {
        unitPrice: { type: Number, required: true },
        subtotal: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        deliveryCharge: { type: Number, default: 0 },
        platformFee: { type: Number, default: 0 },
        totalPayable: { type: Number, required: true },
        advanceRequired: { type: Number, required: true }
    },

    formData: { type: Schema.Types.Mixed, required: true },
    attachments: [{ type: String }],
    adminNotes: { type: String },
    designProofUrl: { type: String },

    status: {
        type: String,
        enum: [
            'Submitted',
            'Under Review',
            'Revision Requested',
            'Revised by Customer',
            'Content/Design Approved',
            'Awaiting Payment',
            'Payment Confirmed',
            'In Production',
            'Ready for Pickup',
            'Out for Delivery',
            'Completed',
            'Cancelled'
        ],
        default: 'Submitted'
    },
    trackingToken: { type: String, unique: true },
}, { timestamps: true });

EnquirySchema.pre<IEnquiry>('save', function () {
    if (!this.trackingToken) {
        this.trackingToken = crypto.randomBytes(8).toString('hex');
    }

});

export default mongoose.model<IEnquiry>('Enquiry', EnquirySchema);