import { create } from 'zustand';
import type { PublicUser, UserStatus } from '@/types/user';
import userService from '@/services/userService';

interface UserState {
  users: Record<string, PublicUser>;
  onlineUsers: Set<string>;
  selectedProfile: PublicUser | null;
  isLoadingProfile: boolean;

  loadProfile: (userId: string) => Promise<void>;
  loadProfileByUsername: (username: string) => Promise<void>;
  setSelectedProfile: (user: PublicUser | null) => void;
  cacheUser: (user: PublicUser) => void;
  cacheUsers: (users: PublicUser[]) => void;
  getUser: (userId: string) => PublicUser | undefined;
  setUserStatus: (userId: string, status: UserStatus) => void;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  searchUsers: (query: string) => Promise<PublicUser[]>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: {},
  onlineUsers: new Set(),
  selectedProfile: null,
  isLoadingProfile: false,

  loadProfile: async (userId) => {
    set({ isLoadingProfile: true });
    try {
      const user = await userService.getProfile(userId);
      set((state) => ({
        selectedProfile: user,
        users: { ...state.users, [userId]: user },
        isLoadingProfile: false,
      }));
    } catch {
      set({ isLoadingProfile: false });
    }
  },

  loadProfileByUsername: async (username) => {
    set({ isLoadingProfile: true });
    try {
      const user = await userService.getProfileByUsername(username);
      set((state) => ({
        selectedProfile: user,
        users: { ...state.users, [user.id]: user },
        isLoadingProfile: false,
      }));
    } catch {
      set({ isLoadingProfile: false });
    }
  },

  setSelectedProfile: (user) => {
    set({ selectedProfile: user });
  },

  cacheUser: (user) => {
    set((state) => ({
      users: { ...state.users, [user.id]: user },
    }));
  },

  cacheUsers: (users) => {
    set((state) => {
      const updated = { ...state.users };
      users.forEach((u) => {
        updated[u.id] = u;
      });
      return { users: updated };
    });
  },

  getUser: (userId) => {
    return get().users[userId];
  },

  setUserStatus: (userId, status) => {
    set((state) => {
      const user = state.users[userId];
      if (!user) return state;
      return {
        users: {
          ...state.users,
          [userId]: { ...user, status },
        },
      };
    });
  },

  setUserOnline: (userId) => {
    set((state) => {
      const newOnline = new Set(state.onlineUsers);
      newOnline.add(userId);

      const user = state.users[userId];
      const users = user
        ? { ...state.users, [userId]: { ...user, status: 'online' as const } }
        : state.users;

      return { onlineUsers: newOnline, users };
    });
  },

  setUserOffline: (userId) => {
    set((state) => {
      const newOnline = new Set(state.onlineUsers);
      newOnline.delete(userId);

      const user = state.users[userId];
      const users = user
        ? {
            ...state.users,
            [userId]: {
              ...user,
              status: 'offline' as const,
              lastSeen: new Date().toISOString(),
            },
          }
        : state.users;

      return { onlineUsers: newOnline, users };
    });
  },

  searchUsers: async (query) => {
    if (!query.trim()) return [];
    try {
      const result = await userService.searchUsers(query);
      get().cacheUsers(result.items);
      return result.items;
    } catch {
      return [];
    }
  },
}));

export default useUserStore;
