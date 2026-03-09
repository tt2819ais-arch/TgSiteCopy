import { Request, Response } from 'express';
import authService from '../services/authService';
import UserModel from '../models/User';
import { successResponse } from '../utils/helpers';
import { cleanUsername } from '../utils/helpers';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const result = await authService.register(username, password);
      res.status(201).json(successResponse(result));
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const result = await authService.login(username, password);
      res.json(successResponse(result));
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message });
    }
  },

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refresh(refreshToken);
      res.json(successResponse(tokens));
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message });
    }
  },

  async me(req: Request, res: Response) {
    try {
      const user = await authService.getMe(req.user!.userId);
      res.json(successResponse(user));
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  },

  async checkUsername(req: Request, res: Response) {
    try {
      const username = cleanUsername(req.query.username as string || '');
      const exists = await UserModel.usernameExists(username);
      res.json(successResponse({
        available: !exists,
        message: exists ? 'Имя занято' : 'Имя свободно',
      }));
    } catch {
      res.status(500).json({ success: false, error: 'Ошибка проверки' });
    }
  },

  async logout(_req: Request, res: Response) {
    res.json(successResponse(null, 'Вы вышли из аккаунта'));
  },
};

export default authController;
