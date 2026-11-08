import express, { Request, Response } from "express";
import cors from "cors";
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { errorHandler } from './middlewares/errorHandler';
import morgan from "morgan";

import catalogRoutes from './routes/catalogRoutes';
import enquiryRoutes from './routes/enquiryRoutes'
import authRoutes from './routes/authRoutes'
import { verifyWebhook } from "./controllers/paymentController";
import paymentRoutes from "./routes/paymentRoutes"
//Load ENV
dotenv.config();

const app = express();

//Middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), verifyWebhook);

app.use(express.json());
app.use(cookieParser());

//DB connection
connectDB();


//routes
app.use('/api/v1/catalog', catalogRoutes)
app.use('/api/v1/enquiries', enquiryRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/payments', paymentRoutes);



// Health Check Route
app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Al Falah Art API is running' });
});



// Global Error Handler (Must be the last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});