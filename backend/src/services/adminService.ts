import UserModel from '../models/User';
import BanModel from '../models/Ban';
import GiftModel from '../models/Gift';
import TransactionModel from '../models/Transaction';

export const adminService = {
  async getUsers(offset = 0, limit = 20) {
    const result = await UserModel.getAll(offset, limit);
    return { items: result.items.map(UserModel.toPublic), total: result.total };
  },

  async banUser(userId: string, reason: string, bannedBy: string, duration?: number) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('Пользователь не найден');
    await UserModel.update(userId, { isBanned: true, status: 'offline' });
    await BanModel.create(userId, user.username, reason, bannedBy, duration);
  },

  async unbanUser(userId: string) {
    await UserModel.update(userId, { isBanned: false });
    await BanModel.deactivate(userId);
  },

  async verifyUser(userId: string) {
    await UserModel.update(userId, { isVerified: true });
  },

  async unverifyUser(userId: string) {
    await UserModel.update(userId, { isVerified: false });
  },

  async setBalance(userId: string, balance: number) {
    await UserModel.update(userId, { balance });
  },

  async addBalance(userId: string, amount: number) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('Пользователь не найден');
    await UserModel.update(userId, { balance: user.balance + amount });
  },

  async getEconomyStats() {
    const users = await UserModel.getAll(0, 100000);
    const txStats = await TransactionModel.getStats();
    const gifts = await GiftModel.getAll(0, 100000);

    const totalBalance = users.items.reduce((sum, u) => sum + u.balance, 0);

    return {
      totalUsers: users.total,
      totalBalance,
      totalTransactions: txStats.totalTransactions,
      totalGiftsSent: txStats.totalGiftsSent,
      activeGifts: gifts.total,
    };
  },
};

export default adminService;
