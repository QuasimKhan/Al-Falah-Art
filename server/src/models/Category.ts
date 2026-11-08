import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date
}

const CategorySchema = new Schema<ICategory>({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });


const Category = mongoose.model<ICategory>("Category", CategorySchema);
export default Category;


