import express from 'express';
import authRoutes from './authRoutes.js';
import gameRoutes from './gameRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/games', gameRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

export default router;
