import redis from '../config/redis';

export const redisService = {
  async cacheUser(userId: string, data: unknown): Promise<void> {
    await redis.set(`user:${userId}`, JSON.stringify(data), 300);
  },

  async getCachedUser(userId: string): Promise<unknown | null> {
    const cached = await redis.get(`user:${userId}`);
    return cached ? JSON.parse(cached) : null;
  },

  async invalidateUser(userId: string): Promise<void> {
    await redis.del(`user:${userId}`);
  },

  async setTyping(chatId: string, userId: string, username: string): Promise<void> {
    await redis.hset(`typing:${chatId}`, userId, username);
  },

  async removeTyping(chatId: string, userId: string): Promise<void> {
    await redis.hdel(`typing:${chatId}`, userId);
  },

  async getTyping(chatId: string): Promise<Record<string, string>> {
    return await redis.hgetall(`typing:${chatId}`);
  },
};

export default redisService;
