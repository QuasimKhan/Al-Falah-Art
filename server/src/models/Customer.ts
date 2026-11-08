import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
    name: string;
    phone: string;
    email?: string;
    createdAt: Date;
    updatedAt: Date;
}


const CustomerSchema = new Schema<ICustomer>({
    name: {
        type: String,
        required: true,

    },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
}, { timestamps: true })


const Customer = mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;