import { Request, Response, NextFunction } from 'express';
import connectDB from '../config/database';

/**
 * Middleware to ensure database connection for serverless environments
 * This is crucial for Vercel/serverless deployments where connections don't persist
 */
export const ensureDbConnection = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await connectDB();
    next();
  } catch (error: any) {
    console.error('Database connection failed:', error);
    res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable. Database connection failed.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
