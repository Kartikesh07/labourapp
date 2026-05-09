import { Router } from 'express';
import { getWorkers } from '../controllers/workers.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getWorkers);

export default router;
