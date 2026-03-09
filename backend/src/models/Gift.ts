import { generateId } from '../utils/helpers';

export interface GiftRecord {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  rarity: string;
  category: string;
  isLimited: boolean;
  maxSupply: number | null;
  currentSupply: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserGiftRecord {
  id: string;
  giftId: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  isDisplayed: boolean;
  receivedAt: string;
}

const gifts: Map<string, GiftRecord> = new Map();
const userGifts: UserGiftRecord[] = [];

export const GiftModel = {
  async create(data: Omit<GiftRecord, 'id' | 'currentSupply' | 'isActive' | 'createdAt'>): Promise<GiftRecord> {
    const gift: GiftRecord = {
      ...data,
      id: generateId(),
      currentSupply: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    gifts.set(gift.id, gift);
    return gift;
  },

  async findById(id: string): Promise<GiftRecord | null> {
    return gifts.get(id) || null;
  },

  async getAll(offset = 0, limit = 24, category?: string): Promise<{ items: GiftRecord[]; total: number }> {
    let all = Array.from(gifts.values()).filter((g) => g.isActive);
    if (category) all = all.filter((g) => g.category === category);
    return { items: all.slice(offset, offset + limit), total: all.length };
  },

  async update(id: string, updates: Partial<GiftRecord>): Promise<GiftRecord | null> {
    const gift = gifts.get(id);
    if (!gift) return null;
    const updated = { ...gift, ...updates };
    gifts.set(id, updated);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    return gifts.delete(id);
  },

  async addUserGift(giftId: string, fromUserId: string, toUserId: string, message = ''): Promise<UserGiftRecord> {
    const ug: UserGiftRecord = {
      id: generateId(),
      giftId, fromUserId, toUserId, message,
      isDisplayed: true,
      receivedAt: new Date().toISOString(),
    };
    userGifts.push(ug);
    return ug;
  },

  async getUserGifts(userId: string, offset = 0, limit = 24): Promise<{ items: UserGiftRecord[]; total: number }> {
    const filtered = userGifts.filter((ug) => ug.toUserId === userId);
    return { items: filtered.slice(offset, offset + limit), total: filtered.length };
  },

  async updateUserGift(id: string, updates: Partial<UserGiftRecord>): Promise<void> {
    const idx = userGifts.findIndex((ug) => ug.id === id);
    if (idx >= 0) userGifts[idx] = { ...userGifts[idx], ...updates };
  },
};

export default GiftModel;
