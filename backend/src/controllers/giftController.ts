import { Request, Response } from 'express';
import giftService from '../services/giftService';
import { successResponse } from '../utils/helpers';

export const giftController = {
  async getGifts(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 24;
    const category = req.query.category as string | undefined;
    const result = await giftService.getGifts(page, limit, category);
    res.json(successResponse(result));
  },

  async getGift(req: Request, res: Response) {
    const { default: GiftModel } = await import('../models/Gift');
    const gift = await GiftModel.findById(req.params.giftId);
    if (!gift) { res.status(404).json({ success: false, error: 'Подарок не найден' }); return; }
    res.json(successResponse(gift));
  },

  async buyGift(req: Request, res: Response) {
    try {
      const result = await giftService.buyGift(req.user!.userId, req.params.giftId);
      res.json(successResponse(result));
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async sendGift(req: Request, res: Response) {
    try {
      const { giftId, toUserId, message } = req.body;
      const result = await giftService.sendGift(req.user!.userId, toUserId, giftId, message);
      res.json(successResponse(result));
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async getMyGifts(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const result = await giftService.getUserGifts(req.user!.userId, page);
    res.json(successResponse(result));
  },

  async getUserGifts(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const result = await giftService.getUserGifts(req.params.userId, page);
    res.json(successResponse(result));
  },

  async getHistory(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const result = await giftService.getHistory(req.user!.userId, page);
    res.json(successResponse(result));
  },

  async toggleDisplay(req: Request, res: Response) {
    const { default: GiftModel } = await import('../models/Gift');
    await GiftModel.updateUserGift(req.params.userGiftId, { isDisplayed: req.body.isDisplayed });
    res.json(successResponse(null));
  },
};

export default giftController;
