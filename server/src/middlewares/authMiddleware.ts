import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import Admin from '../models/Admin';

// Extend Express Request to hold the user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const protectAdmin = async (req: Request, res: Response, next: NextFunction) => {
    let token = req.cookies.jwt;

    if (!token) {
        return next(new AppError('Not authorized, no token', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        req.user = await Admin.findById(decoded.id).select('-passwordHash');
        next();
    } catch (error) {
        return next(new AppError('Not authorized, token failed', 401));
    }
};