import { generateId } from '../utils/helpers';

export interface ChatRecord {
  id: string;
  type: 'private' | 'group';
  name: string | null;
  avatar: string | null;
  participantIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipantRecord {
  userId: string;
  chatId: string;
  role: 'owner' | 'admin' | 'member';
  isPinned: boolean;
  isMuted: boolean;
  unreadCount: number;
  joinedAt: string;
}

const chats: Map<string, ChatRecord> = new Map();
const participants: Map<string, ChatParticipantRecord[]> = new Map(); // chatId -> participants

export const ChatModel = {
  async create(type: 'private' | 'group', participantIds: string[], name?: string): Promise<ChatRecord> {
    const id = generateId();
    const now = new Date().toISOString();

    const chat: ChatRecord = {
      id, type, name: name || null, avatar: null,
      participantIds, createdAt: now, updatedAt: now,
    };
    chats.set(id, chat);

    const parts: ChatParticipantRecord[] = participantIds.map((uid, i) => ({
      userId: uid, chatId: id,
      role: i === 0 ? 'owner' as const : 'member' as const,
      isPinned: false, isMuted: false, unreadCount: 0,
      joinedAt: now,
    }));
    participants.set(id, parts);

    return chat;
  },

  async findById(id: string): Promise<ChatRecord | null> {
    return chats.get(id) || null;
  },

  async findPrivateChat(userId1: string, userId2: string): Promise<ChatRecord | null> {
    for (const chat of chats.values()) {
      if (chat.type === 'private' &&
          chat.participantIds.includes(userId1) &&
          chat.participantIds.includes(userId2)) {
        return chat;
      }
    }
    return null;
  },

  async getUserChats(userId: string): Promise<ChatRecord[]> {
    return Array.from(chats.values()).filter(
      (c) => c.participantIds.includes(userId)
    );
  },

  async getParticipants(chatId: string): Promise<ChatParticipantRecord[]> {
    return participants.get(chatId) || [];
  },

  async getParticipant(chatId: string, userId: string): Promise<ChatParticipantRecord | null> {
    const parts = participants.get(chatId) || [];
    return parts.find((p) => p.userId === userId) || null;
  },

  async updateParticipant(chatId: string, userId: string, updates: Partial<ChatParticipantRecord>): Promise<void> {
    const parts = participants.get(chatId) || [];
    const idx = parts.findIndex((p) => p.userId === userId);
    if (idx >= 0) {
      parts[idx] = { ...parts[idx], ...updates };
      participants.set(chatId, parts);
    }
  },

  async delete(id: string): Promise<boolean> {
    participants.delete(id);
    return chats.delete(id);
  },

  async incrementUnread(chatId: string, excludeUserId: string): Promise<void> {
    const parts = participants.get(chatId) || [];
    parts.forEach((p) => {
      if (p.userId !== excludeUserId) p.unreadCount++;
    });
    participants.set(chatId, parts);
  },

  async resetUnread(chatId: string, userId: string): Promise<void> {
    await this.updateParticipant(chatId, userId, { unreadCount: 0 });
  },
};

export default ChatModel;
