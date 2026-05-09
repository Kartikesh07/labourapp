import { body, query } from 'express-validator';
import { validate } from './auth.validator'; // Reuse validate function

export const getJobsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate
];

export const createJobValidator = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('job_type').isIn(['full-time', 'part-time', 'contract', 'daily']).withMessage('Invalid job type'),
  body('salary_amount').isNumeric().withMessage('Salary amount must be a number'),
  body('salary_period').isIn(['hourly', 'daily', 'weekly', 'monthly']).withMessage('Invalid salary period'),
  body('location').notEmpty().withMessage('Location is required'),
  body('requirements').optional().isArray().withMessage('Requirements must be an array'),
  validate
];
