import { body } from 'express-validator';
import { validate } from './auth.validator';

export const updateProfileValidator = [
  body('name').optional({ checkFalsy: true }).isString().withMessage('Name cannot be empty'),
  body('phone').optional({ checkFalsy: true }).isString().withMessage('Phone cannot be empty'),
  body('avatar_url').optional({ checkFalsy: true }).isURL().withMessage('Avatar must be a valid URL'),
  body('avatar_base64').optional({ checkFalsy: true }).isString().withMessage('Avatar base64 must be a string'),
  body('avatar_type').optional({ checkFalsy: true }).isString().withMessage('Avatar type must be a string'),
  // Worker fields
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('experience').optional().isString(),
  body('location').optional().isString(),
  body('bio').optional().isString(),
  // Employer fields
  body('company_name').optional().isString(),
  body('company_logo_url').optional().isURL(),
  body('description').optional().isString(),
  validate
];

export const updateAvailabilityValidator = [
  body('available').isBoolean().withMessage('Available must be a boolean'),
  validate
];
