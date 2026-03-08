export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export type WSEventType =
  | 'message:new'
  | 'message:update'
  | 'message:delete'
  | 'message:reaction'
  | 'message:read'
  | 'typing:start'
  | 'typing:stop'
  | 'user:online'
  | 'user:offline'
  | 'chat:created'
  | 'chat:updated'
  | 'gift:received'
  | 'notification'
  | 'error'
  | 'pong';

export interface WSMessage<T = unknown> {
  event: WSEventType;
  data: T;
  timestamp: string;
}

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  danger?: boolean;
  disabled?: boolean;
  separator?: boolean;
  onClick?: () => void;
}

export interface FileUploadResult {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}
