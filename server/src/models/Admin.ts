import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: string;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const AdminSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'owner' },
}, { timestamps: true });



export default mongoose.model<IAdmin>('Admin', AdminSchema);