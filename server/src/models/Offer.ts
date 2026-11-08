import mongoose, { Schema, Document } from 'mongoose';

export interface IOffer extends Document {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    validFrom: Date;
    validUntil: Date;
    isActive: boolean;
}

const OfferSchema: Schema = new Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IOffer>('Offer', OfferSchema);