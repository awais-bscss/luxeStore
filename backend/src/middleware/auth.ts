import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import SystemSettings from '../models/SystemSettings.model';
import { AuthRequest } from '../types/auth.types';
import { UnauthorizedError, ForbiddenError, AppError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';
import config from '../config';
import { UserRole } from '../constants';

interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Protect routes - verify JWT token
 */
export const protect = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new UnauthorizedError('Not authorized to access this route');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

      // Get user from token
      const user = await User.findById(decoded.id).select('+status +lastActivity');

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // 1. Check if user is blocked
      if (user.status === 'blocked') {
        throw new ForbiddenError('Your account has been blocked. Please contact support.');
      }

      // 2. Check for Session Timeout
      const settings = await SystemSettings.findOne();
      const sessionTimeoutMinutes = settings?.sessionTimeout || 30;

      const lastActivityTime = new Date(user.lastActivity).getTime();
      const currentTime = new Date().getTime();
      const diffInMinutes = (currentTime - lastActivityTime) / (1000 * 60);

      if (diffInMinutes > sessionTimeoutMinutes) {
        // Session expired - clear cookie and throw error
        res.cookie('token', 'none', {
          expires: new Date(Date.now() + 10 * 1000),
          httpOnly: true,
        });
        throw new UnauthorizedError('Session expired due to inactivity. Please login again.');
      }

      // 3. Update Last Activity (only if it was more than 1 minute ago to reduce DB writes)
      if (diffInMinutes > 1) {
        user.lastActivity = new Date();
        await user.save({ validateBeforeSave: false });
      }

      // Attach user to request (convert ObjectId to string)
      const userObj = user.toObject();
      req.user = {
        ...userObj,
        _id: userObj._id.toString()
      };
      next();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new UnauthorizedError('Not authorized to access this route');
    }
  }
);

/**
 * Authorize specific roles
 * @deprecated Use requireRole or requirePermission from permissions middleware instead
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenError(
        `User role '${req.user?.role}' is not authorized to access this route`
      );
    }
    next();
  };
};
