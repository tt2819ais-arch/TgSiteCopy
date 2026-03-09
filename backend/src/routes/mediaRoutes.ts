import { Router } from 'express';
import mediaController from '../controllers/mediaController';
import authMiddleware from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/upload', authMiddleware, upload.single('file'), mediaController.upload);

export default router;
