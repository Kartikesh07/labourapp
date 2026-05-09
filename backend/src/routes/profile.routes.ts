import { Router } from 'express';
import { getProfile, updateProfile, updateAvailability } from '../controllers/profile.controller';
import { updateProfileValidator, updateAvailabilityValidator } from '../validators/profile.validator';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getProfile);
router.put('/', authenticate, updateProfileValidator, updateProfile);
router.patch('/availability', authenticate, requireRole('worker'), updateAvailabilityValidator, updateAvailability);

export default router;
