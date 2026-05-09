import { Router } from 'express';
import { createApplication, getMyApplications, getJobApplicants, updateApplicationStatus } from '../controllers/applications.controller';
import { createApplicationValidator, updateApplicationStatusValidator } from '../validators/applications.validator';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, requireRole('worker'), createApplicationValidator, createApplication);
router.get('/my-applications', authenticate, requireRole('worker'), getMyApplications);
router.get('/job/:jobId', authenticate, requireRole('employer'), getJobApplicants);
router.patch('/:id/status', authenticate, requireRole('employer'), updateApplicationStatusValidator, updateApplicationStatus);

export default router;
