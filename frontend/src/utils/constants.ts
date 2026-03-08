// ─── API ────────────────────────────────────────────
export const API_BASE_URL = '/api';
export const WS_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

// ─── Лимиты ────────────────────────────────────────
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 11;
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 64;
export const BIO_MAX_LENGTH = 200;
export const MESSAGE_MAX_LENGTH = 4000;
export const CHAT_NAME_MAX_LENGTH = 64;

// ─── Медиа ─────────────────────────────────────────
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_VOICE_DURATION = 300; // 5 минут
export const MAX_VIDEO_CIRCLE_DURATION = 60; // 1 минута

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
export const ALLOWED_AUDIO_TYPES = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg'];
export const ALLOWED_FILE_TYPES = ['*'];

export const AVATAR_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const AVATAR_DIMENSIONS = { width: 512, height: 512 };

// ─── Пагинация ─────────────────────────────────────
export const MESSAGES_PER_PAGE = 50;
export const CHATS_PER_PAGE = 30;
export const USERS_PER_PAGE = 20;
export const GIFTS_PER_PAGE = 24;

// ─── Время ──────────────────────────────────────────
export const TYPING_TIMEOUT = 3000;
export const TYPING_DEBOUNCE = 500;
export const RECONNECT_INTERVAL = 3000;
export const MAX_RECONNECT_ATTEMPTS = 10;
export const PRESENCE_INTERVAL = 30000;
export const TOAST_DURATION = 4000;

// ─── Подарки: редкость ─────────────────────────────
export const RARITY_LABELS: Record<string, string> = {
  common: 'Обычный',
  rare: 'Редкий',
  epic: 'Эпический',
  legendary: 'Легендарный',
};

export const RARITY_COLORS: Record<string, string> = {
  common: '#9e9e9e',
  rare: '#2196f3',
  epic: '#9c27b0',
  legendary: '#ff9800',
};

// ─── Подарки: категории ────────────────────────────
export const CATEGORY_LABELS: Record<string, string> = {
  card: 'Открытка',
  collectible: 'Коллекционный',
  decoration: 'Украшение',
  special: 'Особый',
};

// ─── Статусы сообщений ─────────────────────────────
export const MESSAGE_STATUS_ICONS: Record<string, string> = {
  sending: '○',
  sent: '✓',
  delivered: '✓✓',
  read: '✓✓',
  error: '!',
};

// ─── UI ─────────────────────────────────────────────
export const MOBILE_BREAKPOINT = 768;
export const TABLET_BREAKPOINT = 1024;

// ─── Дефолтный аватар ───────────────────────────────
export const DEFAULT_AVATAR_COLORS = [
  '#e57373', '#f06292', '#ba68c8', '#9575cd',
  '#7986cb', '#64b5f6', '#4fc3f7', '#4dd0e1',
  '#4db6ac', '#81c784', '#aed581', '#dce775',
  '#fff176', '#ffd54f', '#ffb74d', '#ff8a65',
];
