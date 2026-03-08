export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'voice'
  | 'video_circle'
  | 'file'
  | 'gift'
  | 'system';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';

export type AttachmentType = 'image' | 'video' | 'audio' | 'file';

export interface MessageAttachment {
  id: string;
  type: AttachmentType;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail?: string;
  waveform?: number[];
}

export interface MessageReaction {
  emoji: string;
  count: number;
  userIds: string[];
  hasReacted: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderUsername: string;
  senderAvatar: string | null;
  type: MessageType;
  content: string;
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
  status: MessageStatus;
  replyToId: string | null;
  replyToPreview: ReplyPreview | null;
  isEdited: boolean;
  isDeleted: boolean;
  giftId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReplyPreview {
  id: string;
  senderId: string;
  senderUsername: string;
  content: string;
  type: MessageType;
}

export interface SendMessagePayload {
  chatId: string;
  type: MessageType;
  content: string;
  attachments?: File[];
  replyToId?: string;
  giftId?: string;
}

export interface TypingEvent {
  chatId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface ReadReceiptEvent {
  chatId: string;
  messageId: string;
  userId: string;
  readAt: string;
}
