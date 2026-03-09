import UserModel from '../models/User';

export const userService = {
  async getProfile(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('Пользователь не найден');
    return UserModel.toProfile(user);
  },

  async getByUsername(username: string) {
    const user = await UserModel.findByUsername(username);
    if (!user) throw new Error('Пользователь не найден');
    return UserModel.toProfile(user);
  },

  async updateProfile(userId: string, updates: { bio?: string; avatar?: string | null }) {
    const user = await UserModel.update(userId, updates);
    if (!user) throw new Error('Пользователь не найден');
    return UserModel.toPublic(user);
  },

  async search(query: string) {
    const users = await UserModel.search(query);
    return users.map(UserModel.toProfile);
  },
};

export default userService;
