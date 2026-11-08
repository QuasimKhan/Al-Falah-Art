import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import DesignSample from '../models/DesignSample';
import Product from '../models/Product';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Optionally filter by category if passed in query
        const filter: any = { isActive: true };
        if (req.query.category) {
            const cat = await Category.findOne({ slug: req.query.category });
            if (cat) filter.categoryId = cat._id;
        }

        const products = await Product.find(filter).populate('categoryId', 'name').sort({ name: 1 });
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        next(error);
    }
};

export const getSamples = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { product } = req.query;
        const filter: any = { isActive: true };

        if (product) {
            filter.productId = product;
        }

        const samples = await DesignSample.find(filter).populate('productId', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: samples });
    } catch (error) {
        next(error);
    }
};