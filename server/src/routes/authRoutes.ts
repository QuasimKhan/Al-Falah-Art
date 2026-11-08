import { Router } from 'express';
import { loginAdmin, logoutAdmin, getMe } from '../controllers/authController';
import { protectAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/me', protectAdmin, getMe);

export default router;