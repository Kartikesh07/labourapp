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

// Strict rate limiter for Authentication
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: getStore(),
});

// Moderate rate limiter for APIs that do writing (applications, creating jobs)
export const apiWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 requests per hour
  message: 'Too many requests created from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
});
