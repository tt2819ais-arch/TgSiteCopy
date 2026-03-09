import { Router } from 'express';
import userController from '../controllers/userController';
import authMiddleware from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/search', authMiddleware, userController.search);
router.get('/username/:username', authMiddleware, userController.getByUsername);
router.get('/:userId', authMiddleware, userController.getProfile);
router.patch('/me', authMiddleware, userController.updateProfile);
router.post('/me/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);
router.delete('/me/avatar', authMiddleware, userController.removeAvatar);

export default router;
