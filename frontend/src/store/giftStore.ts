import { create } from 'zustand';
import type { Gift, UserGift, GiftTransaction, GiftCategory } from '@/types/gift';
import giftService from '@/services/giftService';

interface GiftState {
  gifts: Gift[];
  myGifts: UserGift[];
  giftHistory: GiftTransaction[];
  selectedGift: Gift | null;
  isLoadingGifts: boolean;
  isLoadingMyGifts: boolean;
  hasMoreGifts: boolean;
  hasMoreMyGifts: boolean;
  giftPage: number;
  myGiftsPage: number;
  activeCategory: GiftCategory | 'all';
  receivedGiftAnimation: GiftTransaction | null;

  loadGifts: (category?: GiftCategory | 'all') => Promise<void>;
  loadMoreGifts: () => Promise<void>;
  loadMyGifts: () => Promise<void>;
  loadMoreMyGifts: () => Promise<void>;
  loadGiftHistory: () => Promise<void>;
  buyGift: (giftId: string) => Promise<void>;
  sendGift: (giftId: string, toUserId: string, message?: string) => Promise<GiftTransaction>;
  toggleDisplayGift: (userGiftId: string, display: boolean) => Promise<void>;
  setSelectedGift: (gift: Gift | null) => void;
  setActiveCategory: (category: GiftCategory | 'all') => void;
  setReceivedGiftAnimation: (transaction: GiftTransaction | null) => void;
  getUserGifts: (userId: string) => Promise<UserGift[]>;
}

export const useGiftStore = create<GiftState>((set, get) => ({
  gifts: [],
  myGifts: [],
  giftHistory: [],
  selectedGift: null,
  isLoadingGifts: false,
  isLoadingMyGifts: false,
  hasMoreGifts: true,
  hasMoreMyGifts: true,
  giftPage: 1,
  myGiftsPage: 1,
  activeCategory: 'all',
  receivedGiftAnimation: null,

  loadGifts: async (category = 'all') => {
    set({ isLoadingGifts: true, activeCategory: category });
    try {
      const result =
        category === 'all'
          ? await giftService.getGifts(1, 24)
          : await giftService.getGiftsByCategory(category, 1);

      set({
        gifts: result.items,
        giftPage: 1,
        hasMoreGifts: result.hasMore,
        isLoadingGifts: false,
      });
    } catch {
      set({ isLoadingGifts: false });
    }
  },

  loadMoreGifts: async () => {
    const { hasMoreGifts, giftPage, isLoadingGifts, activeCategory } = get();
    if (!hasMoreGifts || isLoadingGifts) return;

    set({ isLoadingGifts: true });
    try {
      const nextPage = giftPage + 1;
      const result =
        activeCategory === 'all'
          ? await giftService.getGifts(nextPage, 24)
          : await giftService.getGiftsByCategory(activeCategory, nextPage);

      set((state) => ({
        gifts: [...state.gifts, ...result.items],
        giftPage: nextPage,
        hasMoreGifts: result.hasMore,
        isLoadingGifts: false,
      }));
    } catch {
      set({ isLoadingGifts: false });
    }
  },

  loadMyGifts: async () => {
    set({ isLoadingMyGifts: true });
    try {
      const result = await giftService.getMyGifts(1);
      set({
        myGifts: result.items,
        myGiftsPage: 1,
        hasMoreMyGifts: result.hasMore,
        isLoadingMyGifts: false,
      });
    } catch {
      set({ isLoadingMyGifts: false });
    }
  },

  loadMoreMyGifts: async () => {
    const { hasMoreMyGifts, myGiftsPage, isLoadingMyGifts } = get();
    if (!hasMoreMyGifts || isLoadingMyGifts) return;

    set({ isLoadingMyGifts: true });
    try {
      const nextPage = myGiftsPage + 1;
      const result = await giftService.getMyGifts(nextPage);
      set((state) => ({
        myGifts: [...state.myGifts, ...result.items],
        myGiftsPage: nextPage,
        hasMoreMyGifts: result.hasMore,
        isLoadingMyGifts: false,
      }));
    } catch {
      set({ isLoadingMyGifts: false });
    }
  },

  loadGiftHistory: async () => {
    try {
      const result = await giftService.getGiftHistory(1);
      set({ giftHistory: result.items });
    } catch {
      // error
    }
  },

  buyGift: async (giftId) => {
    const userGift = await giftService.buyGift(giftId);
    set((state) => ({
      myGifts: [userGift, ...state.myGifts],
    }));
  },

  sendGift: async (giftId, toUserId, message) => {
    const transaction = await giftService.sendGift({ giftId, toUserId, message });
    set((state) => ({
      giftHistory: [transaction, ...state.giftHistory],
    }));
    return transaction;
  },

  toggleDisplayGift: async (userGiftId, display) => {
    await giftService.toggleDisplayGift(userGiftId, display);
    set((state) => ({
      myGifts: state.myGifts.map((g) =>
        g.id === userGiftId ? { ...g, isDisplayed: display } : g
      ),
    }));
  },

  setSelectedGift: (gift) => {
    set({ selectedGift: gift });
  },

  setActiveCategory: (category) => {
    set({ activeCategory: category });
    get().loadGifts(category);
  },

  setReceivedGiftAnimation: (transaction) => {
    set({ receivedGiftAnimation: transaction });
  },

  getUserGifts: async (userId) => {
    try {
      const result = await giftService.getUserGifts(userId);
      return result.items;
    } catch {
      return [];
    }
  },
}));

export default useGiftStore;
