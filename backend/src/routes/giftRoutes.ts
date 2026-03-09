import { Router } from 'express';
import giftController from '../controllers/giftController';
import authMiddleware from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, giftController.getGifts);
router.get('/my', authMiddleware, giftController.getMyGifts);
router.get('/history', authMiddleware, giftController.getHistory);
router.get('/:giftId', authMiddleware, giftController.getGift);
router.post('/:giftId/buy', authMiddleware, giftController.buyGift);
router.post('/send', authMiddleware, giftController.sendGift);
router.patch('/user/:userGiftId', authMiddleware, giftController.toggleDisplay);

export default router;
