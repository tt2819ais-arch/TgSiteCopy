import { Request, Response } from 'express';
import adminService from '../services/adminService';
import GiftModel from '../models/Gift';
import BanModel from '../models/Ban';
import { successResponse, paginate, paginatedResponse } from '../utils/helpers';

export const adminController = {
  async getUsers(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { offset } = paginate(page, limit);
    const result = await adminService.getUsers(offset, limit);
    res.json(successResponse(paginatedResponse(result.items, result.total, page, limit)));
  },

  async searchUsers(req: Request, res: Response) {
    const { default: UserModel } = await import('../models/User');
    const users = await UserModel.search(req.query.q as string || '');
    res.json(successResponse(users.map(UserModel.toPublic)));
  },

  async banUser(req: Request, res: Response) {
    try {
      await adminService.banUser(req.params.userId, req.body.reason, req.user!.userId, req.body.duration);
      res.json(successResponse(null));
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async unbanUser(req: Request, res: Response) {
    await adminService.unbanUser(req.params.userId);
    res.json(successResponse(null));
  },

  async verifyUser(req: Request, res: Response) {
    await adminService.verifyUser(req.params.userId);
    res.json(successResponse(null));
  },

  async unverifyUser(req: Request, res: Response) {
    await adminService.unverifyUser(req.params.userId);
    res.json(successResponse(null));
  },

  async setBalance(req: Request, res: Response) {
    await adminService.setBalance(req.params.userId, req.body.balance);
    res.json(successResponse(null));
  },

  async addBalance(req: Request, res: Response) {
    await adminService.addBalance(req.params.userId, req.body.amount);
    res.json(successResponse(null));
  },

  async getBans(req: Request, res: Response) {
    const result = await BanModel.getAll();
    res.json(successResponse(paginatedResponse(result.items, result.total, 1, 20)));
  },

  async createGift(req: Request, res: Response) {
    const gift = await GiftModel.create(req.body);
    res.status(201).json(successResponse(gift));
  },

  async updateGift(req: Request, res: Response) {
    const gift = await GiftModel.update(req.params.giftId, req.body);
    res.json(successResponse(gift));
  },

  async deleteGift(req: Request, res: Response) {
    await GiftModel.delete(req.params.giftId);
    res.json(successResponse(null));
  },

  async getEconomyStats(req: Request, res: Response) {
    const stats = await adminService.getEconomyStats();
    res.json(successResponse(stats));
  },
};

export default adminController;
