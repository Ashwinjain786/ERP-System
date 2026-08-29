import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Error] ${err.message}`);
  
  // Do not leak stack traces in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(500).json({
    status: 'error',
    message: isProduction ? 'Internal Server Error' : err.message,
    ...(isProduction ? {} : { stack: err.stack })
  });
};
