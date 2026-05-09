import { Router } from 'express';
import { getJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs } from '../controllers/jobs.controller';
import { getJobsValidator, createJobValidator } from '../validators/jobs.validator';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { apiWriteLimiter } from '../middleware/rate-limiter';

const router = Router();

router.get('/', authenticate, getJobsValidator, getJobs);
router.get('/employer/my-jobs', authenticate, requireRole('employer'), getMyJobs);
router.get('/:id', authenticate, getJobById);
router.post('/', authenticate, requireRole('employer'), apiWriteLimiter, createJobValidator, createJob);
router.put('/:id', authenticate, requireRole('employer'), apiWriteLimiter, updateJob);
router.delete('/:id', authenticate, requireRole('employer'), apiWriteLimiter, deleteJob);

export default router;
