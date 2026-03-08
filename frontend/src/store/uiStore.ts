import { create } from 'zustand';
import type { Toast, ToastVariant, ContextMenuItem } from '@/types/common';
import { generateId } from '@/utils/helpers';
import { TOAST_DURATION, MOBILE_BREAKPOINT } from '@/utils/constants';

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
}

interface ModalState {
  isOpen: boolean;
  component: string | null;
  props: Record<string, unknown>;
}

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  isMobile: boolean;
  screenWidth: number;

  // Toasts
  toasts: Toast[];

  // Context menu
  contextMenu: ContextMenuState;

  // Modal
  modal: ModalState;

  // Theme
  theme: 'dark' | 'light';

  // Panels
  isProfilePanelOpen: boolean;
  isGiftStoreOpen: boolean;
  isSettingsOpen: boolean;

  // Connection
  isOnline: boolean;
  wsConnected: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobile: (isMobile: boolean) => void;
  setScreenWidth: (width: number) => void;

  addToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  removeToast: (id: string) => void;

  showContextMenu: (x: number, y: number, items: ContextMenuItem[]) => void;
  hideContextMenu: () => void;

  openModal: (component: string, props?: Record<string, unknown>) => void;
  closeModal: () => void;

  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  setProfilePanelOpen: (open: boolean) => void;
  setGiftStoreOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;

  setOnline: (online: boolean) => void;
  setWsConnected: (connected: boolean) => void;

  checkMobile: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isSidebarOpen: true,
  isMobile: window.innerWidth < MOBILE_BREAKPOINT,
  screenWidth: window.innerWidth,
  toasts: [],
  contextMenu: { visible: false, x: 0, y: 0, items: [] },
  modal: { isOpen: false, component: null, props: {} },
  theme: (localStorage.getItem('nyxgram_theme') as 'dark' | 'light') || 'dark',
  isProfilePanelOpen: false,
  isGiftStoreOpen: false,
  isSettingsOpen: false,
  isOnline: navigator.onLine,
  wsConnected: false,

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  setSidebarOpen: (open) => {
    set({ isSidebarOpen: open });
  },

  setMobile: (isMobile) => {
    set({ isMobile });
  },

  setScreenWidth: (width) => {
    set({
      screenWidth: width,
      isMobile: width < MOBILE_BREAKPOINT,
    });
  },

  addToast: (message, variant = 'info', duration = TOAST_DURATION) => {
    const id = generateId();
    const toast: Toast = { id, message, variant, duration };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  showContextMenu: (x, y, items) => {
    set({
      contextMenu: { visible: true, x, y, items },
    });
  },

  hideContextMenu: () => {
    set({
      contextMenu: { visible: false, x: 0, y: 0, items: [] },
    });
  },

  openModal: (component, props = {}) => {
    set({
      modal: { isOpen: true, component, props },
    });
  },

  closeModal: () => {
    set({
      modal: { isOpen: false, component: null, props: {} },
    });
  },

  setTheme: (theme) => {
    localStorage.setItem('nyxgram_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },

  toggleTheme: () => {
    const { theme } = get();
    const next = theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  setProfilePanelOpen: (open) => {
    set({ isProfilePanelOpen: open });
  },

  setGiftStoreOpen: (open) => {
    set({ isGiftStoreOpen: open });
  },

  setSettingsOpen: (open) => {
    set({ isSettingsOpen: open });
  },

  setOnline: (online) => {
    set({ isOnline: online });
  },

  setWsConnected: (connected) => {
    set({ wsConnected: connected });
  },

  checkMobile: () => {
    set({
      isMobile: window.innerWidth < MOBILE_BREAKPOINT,
      screenWidth: window.innerWidth,
    });
  },
}));

export default useUIStore;
