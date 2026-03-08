import { create } from 'zustand';
import type { User } from '@/types/user';
import type { Gift, CreateGiftPayload, UpdateGiftPayload } from '@/types/gift';
import adminService, { type BanRecord, type EconomyStats } from '@/services/adminService';

interface AdminState {
  users: User[];
  bans: BanRecord[];
  gifts: Gift[];
  economyStats: EconomyStats | null;
  isLoading: boolean;
  totalUsers: number;
  usersPage: number;
  hasMoreUsers: boolean;

  // Пользователи
  loadUsers: (page?: number) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  banUser: (userId: string, reason: string, duration?: number) => Promise<void>;
  unbanUser: (userId: string) => Promise<void>;
  verifyUser: (userId: string) => Promise<void>;
  unverifyUser: (userId: string) => Promise<void>;
  setUserBalance: (userId: string, balance: number) => Promise<void>;
  addUserBalance: (userId: string, amount: number) => Promise<void>;

  // Баны
  loadBans: () => Promise<void>;

  // Подарки
  loadAdminGifts: () => Promise<void>;
  createGift: (payload: CreateGiftPayload) => Promise<void>;
  updateGift: (giftId: string, payload: UpdateGiftPayload) => Promise<void>;
  deleteGift: (giftId: string) => Promise<void>;

  // Экономика
  loadEconomyStats: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  bans: [],
  gifts: [],
  economyStats: null,
  isLoading: false,
  totalUsers: 0,
  usersPage: 1,
  hasMoreUsers: true,

  loadUsers: async (page = 1) => {
    set({ isLoading: true });
    try {
      const result = await adminService.getUsers(page, 20);
      set({
        users: page === 1 ? result.items : [...get().users, ...result.items],
        totalUsers: result.total,
        usersPage: page,
        hasMoreUsers: result.hasMore,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  searchUsers: async (query) => {
    if (!query.trim()) {
      get().loadUsers(1);
      return;
    }
    set({ isLoading: true });
    try {
      const users = await adminService.searchUsers(query);
      set({ users, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  banUser: async (userId, reason, duration) => {
    await adminService.banUser(userId, reason, duration);
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, status: 'offline' as const } : u
      ),
    }));
  },

  unbanUser: async (userId) => {
    await adminService.unbanUser(userId);
    set((state) => ({
      bans: state.bans.map((b) =>
        b.userId === userId ? { ...b, isActive: false } : b
      ),
    }));
  },

  verifyUser: async (userId) => {
    await adminService.verifyUser(userId);
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, isVerified: true } : u
      ),
    }));
  },

  unverifyUser: async (userId) => {
    await adminService.unverifyUser(userId);
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, isVerified: false } : u
      ),
    }));
  },

  setUserBalance: async (userId, balance) => {
    await adminService.setUserBalance(userId, balance);
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, balance } : u
      ),
    }));
  },

  addUserBalance: async (userId, amount) => {
    await adminService.addUserBalance(userId, amount);
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, balance: u.balance + amount } : u
      ),
    }));
  },

  loadBans: async () => {
    try {
      const result = await adminService.getBans();
      set({ bans: result.items });
    } catch {
      // error
    }
  },

  loadAdminGifts: async () => {
    set({ isLoading: true });
    try {
      const { default: giftService } = await import('@/services/giftService');
      const result = await giftService.getGifts(1, 100);
      set({ gifts: result.items, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createGift: async (payload) => {
    const gift = await adminService.createGift(payload);
    set((state) => ({
      gifts: [gift, ...state.gifts],
    }));
  },

  updateGift: async (giftId, payload) => {
    const gift = await adminService.updateGift(giftId, payload);
    set((state) => ({
      gifts: state.gifts.map((g) => (g.id === giftId ? gift : g)),
    }));
  },

  deleteGift: async (giftId) => {
    await adminService.deleteGift(giftId);
    set((state) => ({
      gifts: state.gifts.filter((g) => g.id !== giftId),
    }));
  },

  loadEconomyStats: async () => {
    try {
      const stats = await adminService.getEconomyStats();
      set({ economyStats: stats });
    } catch {
      // error
    }
  },
}));

export default useAdminStore;
