import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin';
import { AppError } from '../utils/AppError';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
};

export const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (admin) {
            const token = generateToken(admin._id.toString());

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.json({ success: true, data: { id: admin._id, name: admin.name, email: admin.email } });
        } else {
            throw new AppError('Invalid email or password', 401);
        }
    } catch (error) {
        next(error);
    }
};

export const logoutAdmin = (req: Request, res: Response) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.json({ success: true, message: 'Logged out successfully' });
};

export const getMe = (req: Request, res: Response) => {
    if (req.user) {
        res.json({ success: true, data: req.user });
    } else {
        res.status(401).json({ success: false, message: 'Not authorized' });
    }
};