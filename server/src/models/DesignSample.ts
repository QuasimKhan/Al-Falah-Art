import mongoose, { Schema, Document } from 'mongoose';

export interface IDesignSample extends Document {
    productId: mongoose.Types.ObjectId;
    title: string;
    imageUrl: string;
    description?: string;
    isActive: boolean;
}

const DesignSampleSchema: Schema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });


const DesignSample = mongoose.model<IDesignSample>('DesignSample', DesignSampleSchema);

export default DesignSample;