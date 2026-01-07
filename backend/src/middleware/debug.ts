import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';
import SystemSettings from '../models/SystemSettings.model';

/**
 * Enhanced error handler that shows detailed errors when debug mode is enabled
 */
export const errorHandler = async (
  err: any,
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  // Get debug mode setting
  let debugMode = false;
  try {
    const settings = await SystemSettings.findOne();
    debugMode = settings?.debugMode || false;
  } catch (error) {
    console.error('Error fetching debug mode setting:', error);
  }

  // Log error details
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    user: req.user?._id,
  });

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Send response based on debug mode
  if (debugMode) {
    // Detailed error response for debugging
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal server error',
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
        statusCode: statusCode,
      },
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  } else {
    // Production error response (minimal details)
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
};

/**
 * Middleware to log requests when debug mode is enabled
 */
export const debugLogger = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await SystemSettings.findOne();
    const debugMode = settings?.debugMode || false;

    if (debugMode) {
      console.log('🔍 DEBUG:', {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
        user: req.user?._id,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    // Don't block request if debug check fails
    console.error('Error in debug logger:', error);
  }

  next();
};
