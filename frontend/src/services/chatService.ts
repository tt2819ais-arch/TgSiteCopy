import api from './api';
import type { ApiResponse, PaginatedResponse } from '@/types/common';
import type { Chat, ChatPreview, CreateChatPayload } from '@/types/chat';

export const chatService = {
  async getChats(page = 1, limit = 30): Promise<PaginatedResponse<ChatPreview>> {
    const res = await api.get<ApiResponse<PaginatedResponse<ChatPreview>>>('/chats', {
      page,
      limit,
    });
    return res.data;
  },

  async getChat(chatId: string): Promise<Chat> {
    const res = await api.get<ApiResponse<Chat>>(`/chats/${chatId}`);
    return res.data;
  },

  async createChat(payload: CreateChatPayload): Promise<Chat> {
    const res = await api.post<ApiResponse<Chat>>('/chats', payload);
    return res.data;
  },

  async createPrivateChat(userId: string): Promise<Chat> {
    const res = await api.post<ApiResponse<Chat>>('/chats/private', { userId });
    return res.data;
  },

  async deleteChat(chatId: string): Promise<void> {
    await api.delete(`/chats/${chatId}`);
  },

  async pinChat(chatId: string): Promise<void> {
    await api.post(`/chats/${chatId}/pin`);
  },

  async unpinChat(chatId: string): Promise<void> {
    await api.post(`/chats/${chatId}/unpin`);
  },

  async muteChat(chatId: string): Promise<void> {
    await api.post(`/chats/${chatId}/mute`);
  },

  async unmuteChat(chatId: string): Promise<void> {
    await api.post(`/chats/${chatId}/unmute`);
  },

  async markAsRead(chatId: string, messageId: string): Promise<void> {
    await api.post(`/chats/${chatId}/read`, { messageId });
  },

  async searchChats(query: string): Promise<ChatPreview[]> {
    const res = await api.get<ApiResponse<ChatPreview[]>>('/chats/search', { q: query });
    return res.data;
  },
};

export default chatService;
