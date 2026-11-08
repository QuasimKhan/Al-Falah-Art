import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
    deliveryCharge: number;
    platformFeeType: 'fixed' | 'percentage' | 'none';
    platformFeeValue: number;
    advancePaymentPercentage: number; // e.g., 50 for 50% advance
    allowCOD: boolean;
}

const SettingsSchema: Schema = new Schema({
    deliveryCharge: { type: Number, default: 0 },
    platformFeeType: { type: String, enum: ['fixed', 'percentage', 'none'], default: 'none' },
    platformFeeValue: { type: Number, default: 0 },
    advancePaymentPercentage: { type: Number, default: 100, min: 0, max: 100 },
    allowCOD: { type: Boolean, default: false },
}, { timestamps: true });


const Settings = mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;