import type { Message } from './message';
import type { PublicUser } from './user';

export type ChatType = 'private' | 'group';

export interface ChatParticipant {
  userId: string;
  username: string;
  avatar: string | null;
  isVerified: boolean;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface Chat {
  id: string;
  type: ChatType;
  name: string | null;
  avatar: string | null;
  participants: ChatParticipant[];
  lastMessage: Message | null;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatPreview {
  id: string;
  type: ChatType;
  name: string;
  avatar: string | null;
  lastMessageText: string;
  lastMessageTime: string;
  lastMessageSender: string;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isTyping: boolean;
  typingUsers: string[];
  otherUser: PublicUser | null;
}

export interface CreateChatPayload {
  type: ChatType;
  participantIds: string[];
  name?: string;
}

export interface ChatSearchResult {
  id: string;
  name: string;
  avatar: string | null;
  type: ChatType;
  participantCount: number;
}
