import { create } from 'zustand';
import type { Chat, ChatPreview } from '@/types/chat';
import type { TypingEvent } from '@/types/message';
import chatService from '@/services/chatService';

interface ChatState {
  chats: ChatPreview[];
  activeChat: Chat | null;
  activeChatId: string | null;
  isLoadingChats: boolean;
  isLoadingChat: boolean;
  hasMoreChats: boolean;
  chatPage: number;
  searchQuery: string;
  searchResults: ChatPreview[];
  typingUsers: Record<string, string[]>; // chatId -> usernames[]

  loadChats: () => Promise<void>;
  loadMoreChats: () => Promise<void>;
  setActiveChat: (chatId: string | null) => Promise<void>;
  createPrivateChat: (userId: string) => Promise<Chat>;
  deleteChat: (chatId: string) => Promise<void>;
  pinChat: (chatId: string) => Promise<void>;
  unpinChat: (chatId: string) => Promise<void>;
  muteChat: (chatId: string) => Promise<void>;
  unmuteChat: (chatId: string) => Promise<void>;
  searchChats: (query: string) => Promise<void>;
  clearSearch: () => void;
  markChatAsRead: (chatId: string) => void;

  updateChatPreview: (chatId: string, updates: Partial<ChatPreview>) => void;
  addChat: (chat: ChatPreview) => void;
  removeChat: (chatId: string) => void;
  setTyping: (event: TypingEvent) => void;
  incrementUnread: (chatId: string) => void;
  resetUnread: (chatId: string) => void;
  updateLastMessage: (chatId: string, text: string, time: string, sender: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  activeChatId: null,
  isLoadingChats: false,
  isLoadingChat: false,
  hasMoreChats: true,
  chatPage: 1,
  searchQuery: '',
  searchResults: [],
  typingUsers: {},

  loadChats: async () => {
    set({ isLoadingChats: true });
    try {
      const result = await chatService.getChats(1, 30);
      set({
        chats: result.items,
        chatPage: 1,
        hasMoreChats: result.hasMore,
        isLoadingChats: false,
      });
    } catch {
      set({ isLoadingChats: false });
    }
  },

  loadMoreChats: async () => {
    const { hasMoreChats, chatPage, isLoadingChats } = get();
    if (!hasMoreChats || isLoadingChats) return;

    set({ isLoadingChats: true });
    try {
      const nextPage = chatPage + 1;
      const result = await chatService.getChats(nextPage, 30);
      set((state) => ({
        chats: [...state.chats, ...result.items],
        chatPage: nextPage,
        hasMoreChats: result.hasMore,
        isLoadingChats: false,
      }));
    } catch {
      set({ isLoadingChats: false });
    }
  },

  setActiveChat: async (chatId) => {
    if (!chatId) {
      set({ activeChat: null, activeChatId: null });
      return;
    }

    set({ activeChatId: chatId, isLoadingChat: true });
    try {
      const chat = await chatService.getChat(chatId);
      set({ activeChat: chat, isLoadingChat: false });

      // Сбросить непрочитанные
      get().resetUnread(chatId);
    } catch {
      set({ isLoadingChat: false });
    }
  },

  createPrivateChat: async (userId) => {
    const chat = await chatService.createPrivateChat(userId);
    const preview: ChatPreview = {
      id: chat.id,
      type: chat.type,
      name: chat.name || '',
      avatar: chat.avatar,
      lastMessageText: '',
      lastMessageTime: chat.createdAt,
      lastMessageSender: '',
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      isTyping: false,
      typingUsers: [],
      otherUser: null,
    };
    set((state) => ({
      chats: [preview, ...state.chats],
      activeChat: chat,
      activeChatId: chat.id,
    }));
    return chat;
  },

  deleteChat: async (chatId) => {
    await chatService.deleteChat(chatId);
    set((state) => ({
      chats: state.chats.filter((c) => c.id !== chatId),
      activeChat: state.activeChatId === chatId ? null : state.activeChat,
      activeChatId: state.activeChatId === chatId ? null : state.activeChatId,
    }));
  },

  pinChat: async (chatId) => {
    await chatService.pinChat(chatId);
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, isPinned: true } : c
      ),
    }));
  },

  unpinChat: async (chatId) => {
    await chatService.unpinChat(chatId);
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, isPinned: false } : c
      ),
    }));
  },

  muteChat: async (chatId) => {
    await chatService.muteChat(chatId);
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, isMuted: true } : c
      ),
    }));
  },

  unmuteChat: async (chatId) => {
    await chatService.unmuteChat(chatId);
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, isMuted: false } : c
      ),
    }));
  },

  searchChats: 
