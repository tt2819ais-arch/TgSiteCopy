import MessageModel from '../models/Message';
import ChatModel from '../models/Chat';
import UserModel from '../models/User';
import { paginate, paginatedResponse } from '../utils/helpers';

export const messageService = {
  async getMessages(chatId: string, page = 1, limit = 50) {
    const { offset } = paginate(page, limit);
    const result = await MessageModel.getChatMessages(chatId, offset, limit);

    const messagesWithSender = await Promise.all(
      result.items.map(async (msg) => {
        const sender = await UserModel.findById(msg.senderId);
        return {
          ...msg,
          senderUsername: sender?.username || 'Удалённый',
          senderAvatar: sender?.avatar || null,
          replyToPreview: null,
        };
      })
    );

    return paginatedResponse(messagesWithSender, result.total, page, limit);
  },

  async sendMessage(chatId: string, senderId: string, type: string, content: string, replyToId?: string) {
    const message = await MessageModel.create(chatId, senderId, type, content, replyToId);
    const sender = await UserModel.findById(senderId);

    await ChatModel.incrementUnread(chatId, senderId);

    return {
      ...message,
      senderUsername: sender?.username || '',
      senderAvatar: sender?.avatar || null,
      replyToPreview: null,
      status: 'sent',
    };
  },

  async editMessage(chatId: string, messageId: string, content: string) {
    const msg = await MessageModel.update(chatId, messageId, { content, isEdited: true });
    if (!msg) throw new Error('Сообщение не найдено');
    return msg;
  },

  async deleteMessage(chatId: string, messageId: string) {
    const msg = await MessageModel.update(chatId, messageId, { isDeleted: true, content: '' });
    if (!msg) throw new Error('Сообщение не найдено');
    return msg;
  },
};

export default messageService;
