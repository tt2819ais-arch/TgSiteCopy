import GiftModel from '../models/Gift';
import UserModel from '../models/User';
import TransactionModel from '../models/Transaction';
import { paginate, paginatedResponse } from '../utils/helpers';

export const giftService = {
  async getGifts(page = 1, limit = 24, category?: string) {
    const { offset } = paginate(page, limit);
    const result = await GiftModel.getAll(offset, limit, category);
    return paginatedResponse(result.items, result.total, page, limit);
  },

  async buyGift(userId: string, giftId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('Пользователь не найден');

    const gift = await GiftModel.findById(giftId);
    if (!gift) throw new Error('Подарок не найден');
    if (user.balance < gift.price) throw new Error('Недостаточно средств');

    await UserModel.update(userId, { balance: user.balance - gift.price });
    const userGift = await GiftModel.addUserGift(giftId, userId, userId);
    return { ...userGift, gift };
  },

  async sendGift(fromUserId: string, toUserId: string, giftId: string, message = '') {
    const from = await UserModel.findById(fromUserId);
    const to = await UserModel.findById(toUserId);
    const gift = await GiftModel.findById(giftId);

    if (!from || !to || !gift) throw new Error('Данные не найдены');
    if (from.balance < gift.price) throw new Error('Недостаточно средств');

    await UserModel.update(fromUserId, { balance: from.balance - gift.price });
    await GiftModel.addUserGift(giftId, fromUserId, toUserId, message);

    const transaction = await TransactionModel.create({
      giftId, giftName: gift.name, giftImage: gift.image,
      fromUserId, fromUsername: from.username,
      toUserId, toUsername: to.username,
      price: gift.price, message,
    });

    return transaction;
  },

  async getUserGifts(userId: string, page = 1) {
    const { offset } = paginate(page, 24);
    const result = await GiftModel.getUserGifts(userId, offset, 24);

    const withGift = await Promise.all(
      result.items.map(async (ug) => {
        const gift = await GiftModel.findById(ug.giftId);
        const from = await UserModel.findById(ug.fromUserId);
        const to = await UserModel.findById(ug.toUserId);
        return {
          ...ug,
          gift,
          fromUsername: from?.username || '',
          toUsername: to?.username || '',
        };
      })
    );

    return paginatedResponse(withGift, result.total, page, 24);
  },

  async getHistory(userId: string, page = 1) {
    const { offset } = paginate(page, 20);
    const result = await TransactionModel.getUserHistory(userId, offset, 20);
    return paginatedResponse(result.items, result.total, page, 20);
  },
};

export default giftService;
