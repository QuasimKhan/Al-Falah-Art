import mongoose, { Schema, Document } from 'mongoose';

export interface IPricingSlab {
    minQty: number;
    maxQty: number | null; // null means infinity (e.g., 1000+ pieces)
    pricePerUnit: number;
}

export interface IProduct extends Document {
    categoryId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    pricingSlabs: IPricingSlab[];
    isActive: boolean;
}

const PricingSlabSchema = new Schema<IPricingSlab>({
    minQty: { type: Number, required: true },
    maxQty: { type: Number, default: null },
    pricePerUnit: { type: Number, required: true },
});

const ProductSchema = new Schema({
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    pricingSlabs: [PricingSlabSchema],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;