import { Router } from 'express';
import adminController from '../controllers/adminController';
import authMiddleware from '../middleware/auth';
import adminMiddleware from '../middleware/admin';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/users', adminController.getUsers);
router.get('/users/search', adminController.searchUsers);
router.post('/users/:userId/ban', adminController.banUser);
router.post('/users/:userId/unban', adminController.unbanUser);
router.post('/users/:userId/verify', adminController.verifyUser);
router.post('/users/:userId/unverify', adminController.unverifyUser);
router.patch('/users/:userId/balance', adminController.setBalance);
router.post('/users/:userId/balance/add', adminController.addBalance);

router.get('/bans', adminController.getBans);

router.post('/gifts', adminController.createGift);
router.patch('/gifts/:giftId', adminController.updateGift);
router.delete('/gifts/:giftId', adminController.deleteGift);

router.get('/economy/stats', adminController.getEconomyStats);

export default router;
