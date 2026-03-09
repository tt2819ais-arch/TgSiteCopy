import env from './env';

// Имитация Redis — в продакшене ioredis
class RedisClient {
  private store: Map<string, { value: string; expiresAt?: number }> = new Map();
  private connected = false;

  async connect(): Promise<void> {
    console.log(`[Redis] Подключение к ${env.REDIS_HOST}:${env.REDIS_PORT}`);
    this.connected = true;
    console.log('[Redis] Подключено (режим симуляции)');
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const val = await this.get(key);
    return val !== null;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(this.store.keys()).filter((k) => regex.test(k));
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    const existing = await this.get(key);
    const obj = existing ? JSON.parse(existing) : {};
    obj[field] = value;
    await this.set(key, JSON.stringify(obj));
  }

  async hget(key: string, field: string): Promise<string | null> {
    const existing = await this.get(key);
    if (!existing) return null;
    const obj = JSON.parse(existing);
    return obj[field] || null;
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    const existing = await this.get(key);
    if (!existing) return {};
    return JSON.parse(existing);
  }

  async hdel(key: string, field: string): Promise<void> {
    const existing = await this.get(key);
    if (!existing) return;
    const obj = JSON.parse(existing);
    delete obj[field];
    await this.set(key, JSON.stringify(obj));
  }

  async disconnect(): Promise<void> {
    this.store.clear();
    this.connected = false;
    console.log('[Redis] Отключено');
  }
}

export const redis = new RedisClient();
export default redis;
