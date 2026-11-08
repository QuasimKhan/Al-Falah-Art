import { Router } from 'express';
import { getCategories, getProducts, getSamples } from '../controllers/catalogController';

const router = Router();

router.get('/categories', getCategories);
router.get('/products', getProducts); // <-- New endpoint added
router.get('/samples', getSamples);

export default router;