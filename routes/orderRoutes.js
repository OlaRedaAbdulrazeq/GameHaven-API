// routes/orderRoutes.js
import { Router } from 'express';
const router = Router();
import {
  placeOrder,
  getOrderHistory,
  getOrderDetails,
} from '../controllers/orderController';
import { authenticateUser } from '../middleware/auth';

router.use(authenticateUser);

router.post('/', placeOrder);
router.get('/', getOrderHistory);
router.get('/:id', getOrderDetails);

export default router;
