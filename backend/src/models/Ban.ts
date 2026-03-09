import { generateId } from '../utils/helpers';

export interface BanRecord {
  id: string;
  userId: string;
  username: string;
  reason: string;
  bannedBy: string;
  bannedAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

const bans: BanRecord[] = [];

export const BanModel = {
  async create(userId: string, username: string, reason: string, bannedBy: string, duration?: number): Promise<BanRecord> {
    const ban: BanRecord = {
      id: generateId(),
      userId, username, reason, bannedBy,
      bannedAt: new Date().toISOString(),
      expiresAt: duration ? new Date(Date.now() + duration * 1000).toISOString() : null,
      isActive: true,
    };
    bans.push(ban);
    return ban;
  },

  async findActive(userId: string): Promise<BanRecord | null> {
    return bans.find((b) => b.userId === userId && b.isActive) || null;
  },

  async deactivate(userId: string): Promise<void> {
    bans.forEach((b) => {
      if (b.userId === userId) b.isActive = false;
    });
  },

  async getAll(offset = 0, limit = 20): Promise<{ items: BanRecord[]; total: number }> {
    const active = bans.filter((b) => b.isActive);
    return { items: active.slice(offset, offset + limit), total: active.length };
  },
};

export default BanModel;
