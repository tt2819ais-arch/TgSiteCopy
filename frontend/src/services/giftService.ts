import api from './api';
import type { ApiResponse, PaginatedResponse } from '@/types/common';
import type { Gift, UserGift, GiftTransaction, SendGiftPayload } from '@/types/gift';

export const giftService = {
  async getGifts(page = 1, limit = 24): Promise<PaginatedResponse<Gift>> {
    const res = await api.get<ApiResponse<PaginatedResponse<Gift>>>('/gifts', {
      page,
      limit,
    });
    return res.data;
  },

  async getGift(giftId: string): Promise<Gift> {
    const res = await api.get<ApiResponse<Gift>>(`/gifts/${giftId}`);
    return res.data;
  },

  async getGiftsByCategory(category: string, page = 1): Promise<PaginatedResponse<Gift>> {
    const res = await api.get<ApiResponse<PaginatedResponse<Gift>>>('/gifts', {
      category,
      page,
    });
    return res.data;
  },

  async getUserGifts(userId: string, page = 1): Promise<PaginatedResponse<UserGift>> {
    const res = await api.get<ApiResponse<PaginatedResponse<UserGift>>>(
      `/users/${userId}/gifts`,
      { page }
    );
    return res.data;
  },

  async getMyGifts(page = 1): Promise<PaginatedResponse<UserGift>> {
    const res = await api.get<ApiResponse<PaginatedResponse<UserGift>>>('/gifts/my', {
      page,
    });
    return res.data;
  },

  async sendGift(payload: SendGiftPayload): Promise<GiftTransaction> {
    const res = await api.post<ApiResponse<GiftTransaction>>('/gifts/send', payload);
    return res.data;
  },

  async buyGift(giftId: string): Promise<UserGift> {
    const res = await api.post<ApiResponse<UserGift>>(`/gifts/${giftId}/buy`);
    return res.data;
  },

  async getGiftHistory(page = 1): Promise<PaginatedResponse<GiftTransaction>> {
    const res = await api.get<ApiResponse<PaginatedResponse<GiftTransaction>>>(
      '/gifts/history',
      { page }
    );
    return res.data;
  },

  async toggleDisplayGift(userGiftId: string, display: boolean): Promise<void> {
    await api.patch(`/gifts/user/${userGiftId}`, { isDisplayed: display });
  },
};

export default giftService;
