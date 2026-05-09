import { body } from 'express-validator';
import { validate } from './auth.validator';

export const createApplicationValidator = [
  body('job_id').isUUID().withMessage('Valid Job ID is required'),
  body('message').optional().isString().withMessage('Message must be a string'),
  validate
];

export const updateApplicationStatusValidator = [
  body('status').isIn(['reviewed', 'accepted', 'rejected']).withMessage('Invalid status'),
  validate
];
