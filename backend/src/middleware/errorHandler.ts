import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import config from '../config';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error = { ...err } as AppError;
  error.message = err.message;

  // Log error for debugging
  if (config.env === 'development') {
    console.error('❌ Error:', err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(', ');
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  // Handle Mongoose buffering timeout
  if (err.message.includes('buffering timed out')) {
    const message = 'Database connection error. Please check your MONGODB_URI and IP whitelist.';
    error = new AppError(message, 503); // Service Unavailable is more appropriate than 500
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(config.env === 'development' && { stack: err.stack }),
  });
};

/**
 * Handle 404 errors
 */
export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};
