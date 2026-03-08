export type UserRole = 'user' | 'admin' | 'moderator';

export type UserStatus = 'online' | 'offline' | 'away' | 'busy';

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar: string | null;
  bio: string;
  role: UserRole;
  isVerified: boolean;
  balance: number;
  status: UserStatus;
  lastSeen: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string | null;
  bio: string;
  role: UserRole;
  isVerified: boolean;
  balance: number;
  status: UserStatus;
  lastSeen: string | null;
  giftCount: number;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  username: string;
  avatar: string | null;
  bio: string;
  isVerified: boolean;
  status: UserStatus;
  lastSeen: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  passwordConfirm: string;
}

export interface UpdateProfilePayload {
  bio?: string;
  avatar?: string | null;
}
