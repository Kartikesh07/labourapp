import redisClient from '../config/redis';

export class CacheService {
  /**
   * Get data from cache or fetch from source and cache it
   * @param key Redis key
   * @param ttl Time to live in seconds
   * @param fetcher Async function to fetch data if not in cache
   */
  static async getOrSet<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
    if (!redisClient.isOpen) {
      return await fetcher();
    }

    try {
      const cached = await redisClient.get(key);
      if (cached) {
        return JSON.parse(cached);
      }

      const freshData = await fetcher();
      await redisClient.setEx(key, ttl, JSON.stringify(freshData));
      return freshData;
    } catch (error) {
      console.error(`Cache Error for key ${key}:`, error);
      return await fetcher();
    }
  }

  /**
   * Delete keys matching a pattern
   * @param pattern glob pattern (e.g. "jobs:*")
   */
  static async invalidatePattern(pattern: string): Promise<void> {
    if (!redisClient.isOpen) return;

    try {
      let cursor = '0';
      do {
        const res = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 });
        cursor = res.cursor;
        if (res.keys.length > 0) {
          await redisClient.del(res.keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      console.error(`Cache Invalidation Error for pattern ${pattern}:`, error);
    }
  }

  static async delete(key: string): Promise<void> {
    if (redisClient.isOpen) {
      await redisClient.del(key);
    }
  }
}
