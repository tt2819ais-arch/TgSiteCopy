import { Router } from 'express';
import chatController from '../controllers/chatController';
import authMiddleware from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, chatController.getChats);
router.get('/search', authMiddleware, chatController.searchChats);
router.get('/:chatId', authMiddleware, chatController.getChat);
router.post('/private', authMiddleware, chatController.createPrivateChat);
router.delete('/:chatId', authMiddleware, chatController.deleteChat);
router.post('/:chatId/pin', authMiddleware, chatController.pinChat);
router.post('/:chatId/unpin', authMiddleware, chatController.unpinChat);
router.post('/:chatId/mute', authMiddleware, chatController.muteChat);
router.post('/:chatId/unmute', authMiddleware, chatController.unmuteChat);
router.post('/:chatId/read', authMiddleware, chatController.markAsRead);

export default router;
