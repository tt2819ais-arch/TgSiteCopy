import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import chatRoutes from './chatRoutes';
import messageRoutes from './messageRoutes';
import giftRoutes from './giftRoutes';
import adminRoutes from './adminRoutes';
import mediaRoutes from './mediaRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/chats', chatRoutes);
router.use('/chats', messageRoutes);
router.use('/gifts', giftRoutes);
router.use('/admin', adminRoutes);
router.use('/media', mediaRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
