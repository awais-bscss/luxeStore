import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';
import SystemSettings from '../models/SystemSettings.model';

/**
 * Middleware to check if the site is in maintenance mode
 * Allows admins and superadmins to bypass maintenance mode
 * Blocks all other users with a 503 Service Unavailable response
 */
export const checkMaintenanceMode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get system settings
    const settings = await SystemSettings.findOne();

    // If no settings or maintenance mode is off, allow request
    if (!settings || !settings.maintenanceMode) {
      return next();
    }

    // Allow admins and superadmins to bypass maintenance mode
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
      return next();
    }

    // Block all other requests with 503 Service Unavailable
    res.status(503).json({
      success: false,
      message: 'Site is currently under maintenance. Please check back later.',
      maintenanceMode: true,
    });
  } catch (error) {
    // If there's an error checking settings, allow the request to proceed
    // This prevents the site from breaking if the database is unavailable
    console.error('Error checking maintenance mode:', error);
    next();
  }
};
