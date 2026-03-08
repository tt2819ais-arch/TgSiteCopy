import api from './api';
import type { ApiResponse, PaginatedResponse } from '@/types/common';
import type { Message, SendMessagePayload } from '@/types/message';

export const messageService = {
  async getMessages(
    chatId: string,
    page = 1,
    limit = 50
  ): Promise<PaginatedResponse<Message>> {
    const res = await api.get<ApiResponse<PaginatedResponse<Message>>>(
      `/chats/${chatId}/messages`,
      { page, limit }
    );
    return res.data;
  },

  async sendMessage(payload: SendMessagePayload): Promise<Message> {
    if (payload.attachments && payload.attachments.length > 0) {
      const formData = new FormData();
      formData.append('type', payload.type);
      formData.append('content', payload.content);
      if (payload.replyToId) formData.append('replyToId', payload.replyToId);
      if (payload.giftId) formData.append('giftId', payload.giftId);

      payload.attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const res = await api.upload<ApiResponse<Message>>(
        `/chats/${payload.chatId}/messages`,
        formData
      );
      return res.data;
    }

    const res = await api.post<ApiResponse<Message>>(
      `/chats/${payload.chatId}/messages`,
      {
        type: payload.type,
        content: payload.content,
        replyToId: payload.replyToId,
        giftId: payload.giftId,
      }
    );
    return res.data;
  },

  async editMessage(chatId: string, messageId: string, content: string): Promise<Message> {
    const res = await api.patch<ApiResponse<Message>>(
      `/chats/${chatId}/messages/${messageId}`,
      { content }
    );
    return res.data;
  },

  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    await api.delete(`/chats/${chatId}/messages/${messageId}`);
  },

  async addReaction(chatId: string, messageId: string, emoji: string): Promise<void> {
    await api.post(`/chats/${chatId}/messages/${messageId}/reactions`, { emoji });
  },

  async removeReaction(chatId: string, messageId: string, emoji: string): Promise<void> {
    await api.delete(`/chats/${chatId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`);
  },

  async forwardMessage(
    fromChatId: string,
    messageId: string,
    toChatId: string
  ): Promise<Message> {
    const res = await api.post<ApiResponse<Message>>(
      `/chats/${fromChatId}/messages/${messageId}/forward`,
      { toChatId }
    );
    return res.data;
  },
};

export default messageService;
