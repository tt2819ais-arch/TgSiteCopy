import redis from '../config/redis';

export const presenceService = {
  async setOnline(userId: string): Promise<void> {
    await redis.set(`presence:${userId}`, 'online', 60);
  },

  async setOffline(userId: string): Promise<void> {
    await redis.del(`presence:${userId}`);
  },

  async isOnline(userId: string): Promise<boolean> {
    return await redis.exists(`presence:${userId}`);
  },

  async getOnlineUsers(): Promise<string[]> {
    const keys = await redis.keys('presence:*');
    return keys.map((k) => k.replace('presence:', ''));
  },
};

export default presenceService;
