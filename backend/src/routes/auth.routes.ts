import { Router } from 'express';
import { register, login, logout, getMe, refreshToken } from '../controllers/auth.controller';
import { registerValidator, loginValidator, refreshTokenValidator } from '../validators/auth.validator';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rate-limiter';

const router = Router();

router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/refresh', refreshTokenValidator, refreshToken);

export default router;
