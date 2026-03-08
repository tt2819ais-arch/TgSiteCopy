import { create } from 'zustand';
import type { User, LoginCredentials, RegisterCredentials } from '@/types/user';
import authService from '@/services/authService';
import api from '@/services/api';
import wsService from '@/services/websocketService';
import storageService from '@/services/storageService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    try {
      api.loadTokens();

      if (!api.isAuthenticated()) {
        set({ isInitialized: true, isAuthenticated: false });
        return;
      }

      const user = await authService.getMe();
      set({
        user,
        isAuthenticated: true,
        isInitialized: true,
      });

      const token = api.getAccessToken();
      if (token) {
        wsService.connect(token);
      }

      await storageService.init().catch(() => {});
    } catch {
      api.clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { user, tokens } = await authService.login(credentials);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      wsService.connect(tokens.accessToken);
      await storageService.init().catch(() => {});
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка входа';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  register: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { user, tokens } = await authService.register(credentials);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      wsService.connect(tokens.accessToken);
      await storageService.init().catch(() => {});
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка регистрации';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      wsService.disconnect();
      await storageService.clearAll().catch(() => {});
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  updateUser: (updates) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, ...updates } });
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: true });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useAuthStore;
