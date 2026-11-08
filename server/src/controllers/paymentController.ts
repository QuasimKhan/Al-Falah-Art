import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import Enquiry from '../models/Enquiry';
import Payment from '../models/Payment';
import { razorpayInstance } from '../config/razorpay';
import { AppError } from '../utils/AppError';

// Endpoint: POST /api/v1/payments/create-order
// Called by the frontend to initialize payment
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { trackingToken } = req.body;

        const enquiry = await Enquiry.findOne({ trackingToken });
        if (!enquiry) return next(new AppError('Order not found', 404));

        if (enquiry.status !== 'Awaiting Payment') {
            return next(new AppError('Order is not in a payable state', 400));
        }

        // Backend Source of Truth: Get the exact amount required from the snapshot
        const amountToPay = enquiry.pricingSnapshot.advanceRequired;
        const amountInPaise = Math.round(amountToPay * 100); // Razorpay requires paise

        // Create order in Razorpay
        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `rcpt_${enquiry._id.toString().substring(0, 10)}`,
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);

        // Save pending payment record in our DB
        await Payment.create({
            enquiryId: enquiry._id,
            razorpayOrderId: razorpayOrder.id,
            amount: amountToPay,
            type: amountToPay === enquiry.pricingSnapshot.totalPayable ? 'Full' : 'Advance',
            status: 'Pending'
        });

        res.status(200).json({
            success: true,
            data: {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                keyId: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        next(error);
    }
};

// Endpoint: POST /api/v1/payments/webhook
// Called securely by Razorpay servers on success
export const verifyWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET as string;
        const signature = req.headers['x-razorpay-signature'] as string;

        // Verify webhook authenticity (req.body must be raw string here)
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(req.body.toString())
            .digest('hex');

        if (expectedSignature !== signature) {
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        // Parse the payload now that it is verified
        const payload = JSON.parse(req.body.toString());

        if (payload.event === 'payment.captured' || payload.event === 'order.paid') {
            const razorpayOrderId = payload.payload.payment.entity.order_id;
            const razorpayPaymentId = payload.payload.payment.entity.id;

            // 1. Find the pending payment
            const payment = await Payment.findOne({ razorpayOrderId });
            if (payment && payment.status === 'Pending') {
                // 2. Mark payment as Success
                payment.status = 'Success';
                payment.razorpayPaymentId = razorpayPaymentId;
                await payment.save();

                // 3. Update the main Order status
                const enquiry = await Enquiry.findById(payment.enquiryId);
                if (enquiry) {
                    enquiry.status = 'Payment Confirmed';
                    await enquiry.save();
                }
            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};