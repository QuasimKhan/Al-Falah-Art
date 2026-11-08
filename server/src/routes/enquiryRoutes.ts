import { Router } from 'express';
import {
    submitEnquiry,
    getPriceEstimate,
    getAdminEnquiries,
    getAdminEnquiryById,
    uploadDesignProof,
    trackEnquiry,
    approveDesignByCustomer
} from '../controllers/enquiryController';
import { upload } from '../config/cloudinary';
import { protectAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Public / Customer Routes
router.post('/calculate-price', getPriceEstimate);
router.post('/', upload.array('attachments', 5), submitEnquiry);
router.get('/track/:trackingToken', trackEnquiry);
router.patch('/track/:trackingToken/approve', approveDesignByCustomer);

// Admin Routes (Protected)
router.get('/admin', protectAdmin, getAdminEnquiries);
router.get('/admin/:id', protectAdmin, getAdminEnquiryById);
router.patch('/admin/:id/proof', protectAdmin, upload.single('proofImage'), uploadDesignProof);

export default router;