import jwt from 'jsonwebtoken';
import env from '../config/env';
import UserModel from '../models/User';
import BanModel from '../models/Ban';
import type { JwtPayload } from '../types';
import { cleanUsername } from '../utils/helpers';

export const authService = {
  generateTokens(payload: JwtPayload) {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES as string });
    const refreshToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES as string });
    return { accessToken, refreshToken };
  },

  async register(username: string, password: string) {
    const clean = cleanUsername(username);
    const exists = await UserModel.usernameExists(clean);
    if (exists) throw new Error('Имя пользователя уже занято');

    const user = await UserModel.create(clean, password);
    const tokens = this.generateTokens({ userId: user.id, username: user.username, role: user.role });
    return { user: UserModel.toPublic(user), tokens };
  },

  async login(username: string, password: string) {
    const clean = cleanUsername(username);
    const user = await UserModel.findByUsername(clean);
    if (!user) throw new Error('Неверное имя пользователя или пароль');

    const ban = await BanModel.findActive(user.id);
    if (ban) throw new Error('Аккаунт заблокирован: ' + ban.reason);

    const valid = await UserModel.verifyPassword(user, password);
    if (!valid) throw new Error('Неверное имя пользователя или пароль');

    await UserModel.update(user.id, { status: 'online' });
    const tokens = this.generateTokens({ userId: user.id, username: user.username, role: user.role });
    return { user: UserModel.toPublic(user), tokens };
  },

  async refresh(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, env.JWT_SECRET) as JwtPayload;
      const user = await UserModel.findById(payload.userId);
      if (!user) throw new Error('Пользователь не найден');
      return this.generateTokens({ userId: user.id, username: user.username, role: user.role });
    } catch {
      throw new Error('Невалидный refresh токен');
    }
  },

  async getMe(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('Пользователь не найден');
    return UserModel.toPublic(user);
  },
};

export default authService;
