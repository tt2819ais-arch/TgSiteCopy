import { Request, Response } from 'express';
import userService from '../services/userService';
import { successResponse } from '../utils/helpers';

export const userController = {
  async getProfile(req: Request, res: Response) {
    try {
      const profile = await userService.getProfile(req.params.userId);
      res.json(successResponse(profile));
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  },

  async getByUsername(req: Request, res: Response) {
    try {
      const profile = await userService.getByUsername(req.params.username);
      res.json(successResponse(profile));
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const user = await userService.updateProfile(req.user!.userId, req.body);
      res.json(successResponse(user));
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async uploadAvatar(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: 'Файл не прикреплён' });
        return;
      }
      const url = `/uploads/${file.filename}`;
      await userService.updateProfile(req.user!.userId, { avatar: url });
      res.json(successResponse({ url }));
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async removeAvatar(req: Request, res: Response) {
    try {
      await userService.updateProfile(req.user!.userId, { avatar: null });
      res.json(successResponse(null));
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async search(req: Request, res: Response) {
    try {
      const users = await userService.search(req.query.q as string || '');
      res.json(successResponse({ items: users, total: users.length, page: 1, limit: 20, hasMore: false }));
    } catch {
      res.status(500).json({ success: false, error: 'Ошибка поиска' });
    }
  },
};

export default userController;
