export type GiftRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type GiftCategory = 'card' | 'collectible' | 'decoration' | 'special';

export interface Gift {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  rarity: GiftRarity;
  category: GiftCategory;
  isLimited: boolean;
  maxSupply: number | null;
  currentSupply: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserGift {
  id: string;
  giftId: string;
  gift: Gift;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  toUsername: string;
  message: string;
  receivedAt: string;
  isDisplayed: boolean;
}

export interface GiftTransaction {
  id: string;
  giftId: string;
  giftName: string;
  giftImage: string;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  toUsername: string;
  price: number;
  message: string;
  createdAt: string;
}

export interface SendGiftPayload {
  giftId: string;
  toUserId: string;
  message?: string;
}

export interface CreateGiftPayload {
  name: string;
  description: string;
  image: string;
  price: number;
  rarity: GiftRarity;
  category: GiftCategory;
  isLimited: boolean;
  maxSupply?: number;
}

export interface UpdateGiftPayload {
  name?: string;
  description?: string;
  image?: string;
  price?: number;
  rarity?: GiftRarity;
  category?: GiftCategory;
  isLimited?: boolean;
  maxSupply?: number;
  isActive?: boolean;
}
