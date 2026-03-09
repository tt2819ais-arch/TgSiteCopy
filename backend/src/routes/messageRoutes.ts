import { Router } from 'express';
import messageController from '../controllers/messageController';
import authMiddleware from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/:chatId/messages', authMiddleware, messageController.getMessages);
router.post('/:chatId/messages', authMiddleware, upload.array('attachments', 10), messageController.sendMessage);
router.patch('/:chatId/messages/:messageId', authMiddleware, messageController.editMessage);
router.delete('/:chatId/messages/:messageId', authMiddleware, messageController.deleteMessage);
router.post('/:chatId/messages/:messageId/reactions', authMiddleware, messageController.addReaction);
router.delete('/:chatId/messages/:messageId/reactions/:emoji', authMiddleware, messageController.removeReaction);

export default router;
