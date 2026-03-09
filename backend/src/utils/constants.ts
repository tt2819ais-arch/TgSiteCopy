export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const;

export const MESSAGE_TYPES = [
  'text', 'image', 'video', 'voice', 'video_circle', 'file', 'gift', 'system',
] as const;

export const DEFAULT_BALANCE = 1000;
export const ADMIN_BALANCE = 99999999;

export const UPLOAD_PATHS = {
  avatars: 'avatars',
  media: 'media',
  gifts: 'gifts',
} as const;
