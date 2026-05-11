import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/redis';

// Only create a store if Redis is connected, otherwise fallback to memory store
const getStore = () => {
  if (redisClient.isOpen) {
    return new RedisStore({
      // Pass the sendCommand function to rate-limit-redis
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    });
  }
  return undefined;
};

// Strict rate limiter for Authentication - increased for development
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 login/register attempts per 15 minutes
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
});

// Moderate rate limiter for APIs that do writing - increased for development
export const apiWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 write requests per 15 minutes
  message: 'Too many requests created from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
});
