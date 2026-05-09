import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || (statusCode === 500 ? 'ERR_SERVER_ERROR' : 'DEFAULT');
  
  res.status(statusCode).json({
    success: false,
    message,
    code,
    data: null,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
