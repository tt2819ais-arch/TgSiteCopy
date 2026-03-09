import { generateId } from '../utils/helpers';

export interface TransactionRecord {
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

const transactions: TransactionRecord[] = [];

export const TransactionModel = {
  async create(data: Omit<TransactionRecord, 'id' | 'createdAt'>): Promise<TransactionRecord> {
    const tx: TransactionRecord = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    transactions.push(tx);
    return tx;
  },

  async getUserHistory(userId: string, offset = 0, limit = 20): Promise<{ items: TransactionRecord[]; total: number }> {
    const filtered = transactions.filter(
      (t) => t.fromUserId === userId || t.toUserId === userId
    ).reverse();
    return { items: filtered.slice(offset, offset + limit), total: filtered.length };
  },

  async getAll(): Promise<TransactionRecord[]> {
    return [...transactions];
  },

  async getStats() {
    return {
      totalTransactions: transactions.length,
      totalGiftsSent: transactions.length,
    };
  },
};

export default TransactionModel;
