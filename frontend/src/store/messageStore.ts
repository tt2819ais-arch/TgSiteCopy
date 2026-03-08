import { create } from 'zustand';
import type { Message } from '@/types/message';
import messageService from '@/services/messageService';
import { generateTempId } from '@/utils/helpers';

interface MessageState {
  messages: Record<string, Message[]>; // chatId -> messages
  isLoading: boolean;
  hasMore: Record<string, boolean>;
  pages: Record<string, number>;
  replyTo: Message | null;
  editingMessage: Message | null;

  loadMessages: (chatId: string) => Promise<void>;
  loadMoreMessages: (chatId: string) => Promise<void>;
  sendTextMessage: (chatId: string, content: string, senderUsername: string, senderAvatar: string | null) => Promise<void>;
  sendMediaMessage: (chatId: string, type: string, files: File[], senderUsername: string, senderAvatar: string | null) => Promise<void>;
  editMessage: (chatId: string, messageId: string, content: string) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  addReaction: (chatId: string, messageId: string, emoji: string) => Promise<void>;
  removeReaction: (chatId: string, messageId: string, emoji: string) => Promise<void>;

  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  removeMessage: (chatId: string, messageId: string) => void;
  replaceTempMessage: (chatId: string, tempId: string, message: Message) => void;
  setReplyTo: (message: Message | null) => void;
  setEditingMessage: (message: Message | null) => void;
  getChatMessages: (chatId: string) => Message[];
  markMessagesAsRead: (chatId: string, userId: string) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: {},
  isLoading: false,
  hasMore: {},
  pages: {},
  replyTo: null,
  editingMessage: null,

  loadMessages: async (chatId) => {
    set({ isLoading: true });
    try {
      const result = await messageService.getMessages(chatId, 1, 50);
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: result.items.reverse(),
        },
        hasMore: { ...state.hasMore, [chatId]: result.hasMore },
        pages: { ...state.pages, [chatId]: 1 },
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  loadMoreMessages: async (chatId) => {
    const { hasMore, pages, isLoading } = get();
    if (!hasMore[chatId] || isLoading) return;

    set({ isLoading: true });
    try {
      const nextPage = (pages[chatId] || 1) + 1;
      const result = await messageService.getMessages(chatId, nextPage, 50);
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: [...result.items.reverse(), ...(state.messages[chatId] || [])],
        },
        hasMore: { ...state.hasMore, [chatId]: result.hasMore },
        pages: { ...state.pages, [chatId]: nextPage },
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  sendTextMessage: async (chatId, content, senderUsername, senderAvatar) => {
    const { replyTo } = get();
    const tempId = generateTempId();

    const tempMessage: Message = {
      id: tempId,
      chatId,
      senderId: 'me',
      senderUsername,
      senderAvatar,
      type: 'text',
      content,
      attachments: [],
      reactions: [],
      status: 'sending',
      replyToId: replyTo?.id || null,
      replyToPreview: replyTo
        ? {
            id: replyTo.id,
            senderId: replyTo.senderId,
            senderUsername: replyTo.senderUsername,
            content: replyTo.content,
            type: replyTo.type,
          }
        : null,
      isEdited: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    get().addMessage(chatId, tempMessage);
    set({ replyTo: null });

    try {
      const message = await messageService.sendMessage({
        chatId,
        type: 'text',
        content,
        replyToId: replyTo?.id,
      });

      get().replaceTempMessage(chatId, tempId, message);
    } catch {
      get().updateMessage(chatId, tempId, { status: 'error' });
    }
  },

  sendMediaMessage: async (chatId, type, files, senderUsername, senderAvatar) => {
    const tempId = generateTempId();

    const tempMessage: Message = {
      id: tempId,
      chatId,
      senderId: 'me',
      senderUsername,
      senderAvatar,
      type: type as Message['type'],
      content: '',
      attachments: [],
      reactions: [],
      status: 'sending',
      replyToId: null,
      replyToPreview: null,
      isEdited: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    get().addMessage(chatId, tempMessage);

    try {
      const message = await messageService.sendMessage({
        chatId,
        type: type as Message['type'],
        content: '',
        attachments: files,
      });

      get().replaceTempMessage(chatId, tempId, message);
    } catch {
      get().updateMessage(chatId, tempId, { status: 'error' });
    }
  },

  editMessage: async (chatId, messageId, content) => {
    try {
      const updated = await messageService.editMessage(chatId, messageId, content);
      get().updateMessage(chatId, messageId, {
        content: updated.content,
        isEdited: true,
        updatedAt: updated.updatedAt,
      });
      set({ editingMessage: null });
    } catch {
      // error
    }
  },

  deleteMessage: async (chatId, messageId) => {
    try {
      await messageService.deleteMessage(chatId, messageId);
      get().updateMessage(chatId, messageId, { isDeleted: true, content: '' });
    } catch {
      // error
    }
  },

  addReaction: async (chatId, messageId, emoji) => {
    try {
      await messageService.addReaction(chatId, messageId, emoji);
    } catch {
      // error
    }
  },

  removeReaction: async (chatId, messageId, emoji) => {
    try {
      await messageService.removeReaction(chatId, messageId, emoji);
    } catch {
      // error
    }
  },

  addMessage: (chatId, message) => {
    set((state) => {
      const current = state.messages[chatId] || [];
      // Не добавлять дубли
      if (current.find((m) => m.id === message.id)) return state;
      return {
        messages: {
          ...state.messages,
          [chatId]: [...current, message],
        },
      };
    });
  },

  updateMessage: (chatId, messageId, updates) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((m) =>
          m.id === messageId ? { ...m, ...updates } : m
        ),
      },
    }));
  },

  removeMessage: (chatId, messageId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).filter((m) => m.id !== messageId),
      },
    }));
  },

  replaceTempMessage: (chatId, tempId, message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((m) =>
          m.id === tempId ? message : m
        ),
      },
    }));
  },

  setReplyTo: (message) => {
    set({ replyTo: message, editingMessage: null });
  },

  setEditingMessage: (message) => {
    set({ editingMessage: message, replyTo: null });
  },

  getChatMessages: (chatId) => {
    return get().messages[chatId] || [];
  },

  markMessagesAsRead: (chatId, userId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((m) =>
          m.senderId !== userId && m.status !== 'read'
            ? { ...m, status: 'read' as const }
            : m
        ),
      },
    }));
  },
}));

export default useMessageStore;
