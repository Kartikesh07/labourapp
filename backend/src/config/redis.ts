import { createClient } from 'redis';
import { env } from './env';

// Create a Redis client
const redisClient = createClient({
  url: env.redisUrl
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Connected to Redis server'));
redisClient.on('reconnecting', () => console.log('Reconnecting to Redis...'));

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    // don't throw here to avoid crashing the whole API if cache is down initially
  }
};

export default redisClient;