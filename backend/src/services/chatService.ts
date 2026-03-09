import ChatModel from '../models/Chat';
import UserModel from '../models/User';
import MessageModel from '../models/Message';

export const chatService = {
  async getUserChats(userId: string) {
    const chats = await ChatModel.getUserChats(userId);

    const previews = await Promise.all(
      chats.map(async (chat) => {
        const lastMsg = await MessageModel.getLastMessage(chat.id);
        const participant = await ChatModel.getParticipant(chat.id, userId);
        const otherUserId = chat.participantIds.find((id) => id !== userId);
        const otherUser = otherUserId ? await UserModel.findById(otherUserId) : null;

        return {
          id: chat.id,
          type: chat.type,
          name: chat.name || otherUser?.username || 'Чат',
          avatar: chat.avatar,
          lastMessageText: lastMsg?.content || '',
          lastMessageTime: lastMsg?.createdAt || chat.createdAt,
          lastMessageSender: lastMsg ? (await UserModel.findById(lastMsg.senderId))?.username || '' : '',
          unreadCount: participant?.unreadCount || 0,
          isPinned: participant?.isPinned || false,
          isMuted: participant?.isMuted || false,
          isTyping: false,
          typingUsers: [],
          otherUser: otherUser ? UserModel.toProfile(otherUser) : null,
        };
      })
    );

    previews.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
    return { items: previews, total: previews.length, page: 1, limit: 30, hasMore: false };
  },

  async createPrivateChat(userId: string, otherUserId: string) {
    const existing = await ChatModel.findPrivateChat(userId, otherUserId);
    if (existing) return existing;

    const chat = await ChatModel.create('private', [userId, otherUserId]);
    return chat;
  },

  async getChat(chatId: string) {
    const chat = await ChatModel.findById(chatId);
    if (!chat) throw new Error('Чат не найден');

    const parts = await ChatModel.getParticipants(chatId);
    const participantsWithInfo = await Promise.all(
      parts.map(async (p) => {
        const user = await UserModel.findById(p.userId);
        return {
          userId: p.userId,
          username: user?.username || '',
          avatar: user?.avatar || null,
          isVerified: user?.isVerified || false,
          role: p.role,
          joinedAt: p.joinedAt,
        };
      })
    );

    return { ...chat, participants: participantsWithInfo, lastMessage: null };
  },
};

export default chatService;
