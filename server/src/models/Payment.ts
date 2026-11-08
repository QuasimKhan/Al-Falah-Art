import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
    enquiryId: mongoose.Types.ObjectId;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    amount: number;
    status: 'Pending' | 'Success' | 'Failed';
    type: 'Advance' | 'Balance' | 'Full';
}

const PaymentSchema = new Schema({
    enquiryId: { type: Schema.Types.ObjectId, ref: 'Enquiry', required: true },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Success', 'Failed'], default: 'Pending' },
    type: { type: String, enum: ['Advance', 'Balance', 'Full'], required: true },
}, { timestamps: true });

export default mongoose.model<IPayment>('Payment', PaymentSchema);