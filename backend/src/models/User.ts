import { generateId } from '../utils/helpers';
import bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string;
  username: string;
  passwordHash: string;
  avatar: string | null;
  bio: string;
  role: 'user' | 'admin' | 'moderator';
  isVerified: boolean;
  balance: number;
  status: 'online' | 'offline';
  lastSeen: string | null;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

// In-memory хранилище (заменяется на PostgreSQL в продакшене)
const users: Map<string, UserRecord> = new Map();

export const UserModel = {
  async create(username: string, password: string, role: 'user' | 'admin' = 'user', balance = 1000): Promise<UserRecord> {
    const id = generateId();
    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date().toISOString();

    const user: UserRecord = {
      id, username, passwordHash,
      avatar: null, bio: '',
      role, isVerified: role === 'admin',
      balance,
      status: 'offline', lastSeen: null,
      isBanned: false,
      createdAt: now, updatedAt: now,
    };

    users.set(id, user);
    return user;
  },

  async findById(id: string): Promise<UserRecord | null> {
    return users.get(id) || null;
  },

  async findByUsername(username: string): Promise<UserRecord | null> {
    for (const user of users.values()) {
      if (user.username.toLowerCase() === username.toLowerCase()) return user;
    }
    return null;
  },

  async verifyPassword(user: UserRecord, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  },

  async update(id: string, updates: Partial<UserRecord>): Promise<UserRecord | null> {
    const user = users.get(id);
    if (!user) return null;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    users.set(id, updated);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    return users.delete(id);
  },

  async getAll(offset = 0, limit = 20): Promise<{ items: UserRecord[]; total: number }> {
    const all = Array.from(users.values());
    return { items: all.slice(offset, offset + limit), total: all.length };
  },

  async search(query: string): Promise<UserRecord[]> {
    const q = query.toLowerCase();
    return Array.from(users.values()).filter(
      (u) => u.username.toLowerCase().includes(q)
    );
  },

  async usernameExists(username: string): Promise<boolean> {
    const user = await this.findByUsername(username);
    return !!user;
  },

  toPublic(user: UserRecord) {
    return {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      isVerified: user.isVerified,
      balance: user.balance,
      status: user.status,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  toProfile(user: UserRecord) {
    return {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      isVerified: user.isVerified,
      status: user.status,
      lastSeen: user.lastSeen,
    };
  },
};

export default UserModel;
