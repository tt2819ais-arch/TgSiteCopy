import { generateId } from '../utils/helpers';

export interface MessageRecord {
  id: string;
  chatId: string;
  senderId: string;
  type: string;
  content: string;
  attachments: unknown[];
  reactions: unknown[];
  replyToId: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const messages: Map<string, MessageRecord[]> = new Map(); // chatId -> messages

export const MessageModel = {
  async create(chatId: string, senderId: string, type: string, content: string, replyToId?: string): Promise<MessageRecord> {
    const id = generateId();
    const now = new Date().toISOString();

    const message: MessageRecord = {
      id, chatId, senderId, type, content,
      attachments: [], reactions: [],
      replyToId: replyToId || null,
      isEdited: false, isDeleted: false,
      createdAt: now, updatedAt: now,
    };

    if (!messages.has(chatId)) messages.set(chatId, []);
    messages.get(chatId)!.push(message);

    return message;
  },

  async findById(chatId: string, messageId: string): Promise<MessageRecord | null> {
    const msgs = messages.get(chatId) || [];
    return msgs.find((m) => m.id === messageId) || null;
  },

  async getChatMessages(chatId: string, offset = 0, limit = 50): Promise<{ items: MessageRecord[]; total: number }> {
    const msgs = messages.get(chatId) || [];
    const sorted = [...msgs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return {
      items: sorted.slice(offset, offset + limit),
      total: sorted.length,
    };
  },

  async update(chatId: string, messageId: string, updates: Partial<MessageRecord>): Promise<MessageRecord | null> {
    const msgs = messages.get(chatId) || [];
    const idx = msgs.findIndex((m) => m.id === messageId);
    if (idx < 0) return null;
    msgs[idx] = { ...msgs[idx], ...updates, updatedAt: new Date().toISOString() };
    return msgs[idx];
  },

  async getLastMessage(chatId: string): Promise<MessageRecord | null> {
    const msgs = messages.get(chatId) || [];
    if (msgs.length === 0) return null;
    return msgs[msgs.length - 1];
  },
};

export default MessageModel;
