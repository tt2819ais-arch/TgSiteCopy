import api from './api';
import type { ApiResponse, PaginatedResponse } from '@/types/common';
import type { User, PublicUser, UpdateProfilePayload } from '@/types/user';

export const userService = {
  async getProfile(userId: string): Promise<PublicUser> {
    const res = await api.get<ApiResponse<PublicUser>>(`/users/${userId}`);
    return res.data;
  },

  async getProfileByUsername(username: string): Promise<PublicUser> {
    const clean = username.startsWith('@') ? username.slice(1) : username;
    const res = await api.get<ApiResponse<PublicUser>>(`/users/username/${clean}`);
    return res.data;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const res = await api.patch<ApiResponse<User>>('/users/me', payload);
    return res.data;
  },

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await api.upload<ApiResponse<{ url: string }>>('/users/me/avatar', formData);
    return res.data;
  },

  async removeAvatar(): Promise<void> {
    await api.delete('/users/me/avatar');
  },

  async searchUsers(query: string, page = 1, limit = 20): Promise<PaginatedResponse<PublicUser>> {
    const res = await api.get<ApiResponse<PaginatedResponse<PublicUser>>>('/users/search', {
      q: query,
      page,
      limit,
    });
    return res.data;
  },

  async getOnlineUsers(): Promise<PublicUser[]> {
    const res = await api.get<ApiResponse<PublicUser[]>>('/users/online');
    return res.data;
  },
};

export default userService;
