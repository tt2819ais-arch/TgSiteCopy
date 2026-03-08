import api from './api';
import type { ApiResponse, PaginatedResponse } from '@/types/common';
import type { User } from '@/types/user';
import type { Gift, CreateGiftPayload, UpdateGiftPayload } from '@/types/gift';

export interface BanRecord {
  id: string;
  userId: string;
  username: string;
  reason: string;
  bannedBy: string;
  bannedAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

export interface EconomyStats {
  totalUsers: number;
  totalBalance: number;
  totalTransactions: number;
  totalGiftsSent: number;
  activeGifts: number;
}

export const adminService = {
  // Пользователи
  async getUsers(page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    const res = await api.get<ApiResponse<PaginatedResponse<User>>>('/admin/users', {
      page,
      limit,
    });
    return res.data;
  },

  async searchUsers(query: string): Promise<User[]> {
    const res = await api.get<ApiResponse<User[]>>('/admin/users/search', { q: query });
    return res.data;
  },

  async banUser(userId: string, reason: string, duration?: number): Promise<void> {
    await api.post(`/admin/users/${userId}/ban`, { reason, duration });
  },

  async unbanUser(userId: string): Promise<void> {
    await api.post(`/admin/users/${userId}/unban`);
  },

  async getBans(page = 1): Promise<PaginatedResponse<BanRecord>> {
    const res = await api.get<ApiResponse<PaginatedResponse<BanRecord>>>('/admin/bans', {
      page,
    });
    return res.data;
  },

  // Верификация
  async verifyUser(userId: string): Promise<void> {
    await api.post(`/admin/users/${userId}/verify`);
  },

  async unverifyUser(userId: string): Promise<void> {
    await api.post(`/admin/users/${userId}/unverify`);
  },

  // Баланс
  async setUserBalance(userId: string, balance: number): Promise<void> {
    await api.patch(`/admin/users/${userId}/balance`, { balance });
  },

  async addUserBalance(userId: string, amount: number): Promise<void> {
    await api.post(`/admin/users/${userId}/balance/add`, { amount });
  },

  // Подарки
  async createGift(payload: CreateGiftPayload): Promise<Gift> {
    const res = await api.post<ApiResponse<Gift>>('/admin/gifts', payload);
    return res.data;
  },

  async updateGift(giftId: string, payload: UpdateGiftPayload): Promise<Gift> {
    const res = await api.patch<ApiResponse<Gift>>(`/admin/gifts/${giftId}`, payload);
    return res.data;
  },

  async deleteGift(giftId: string): Promise<void> {
    await api.delete(`/admin/gifts/${giftId}`);
  },

  async uploadGiftImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.upload<ApiResponse<{ url: string }>>('/admin/gifts/upload-image', formData);
    return res.data;
  },

  // Экономика
  async getEconomyStats(): Promise<EconomyStats> {
    const res = await api.get<ApiResponse<EconomyStats>>('/admin/economy/stats');
    return res.data;
  },
};

export default adminService;
