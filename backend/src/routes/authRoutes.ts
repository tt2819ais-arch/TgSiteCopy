import { Router } from 'express';
import authController from '../controllers/authController';
import authMiddleware from '../middleware/auth';
import { validateRegistration, validateLogin } from '../middleware/validation';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();

router.post('/register', rateLimit(10, 60000), validateRegistration, authController.register);
router.post('/login', rateLimit(20, 60000), validateLogin, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);
router.get('/check-username', authController.checkUsername);

export default router;
