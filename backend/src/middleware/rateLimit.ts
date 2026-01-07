import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';
import SystemSettings from '../models/SystemSettings.model';

// Store for tracking request counts per user
// In production, use Redis for better performance and persistence
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware based on system settings
 * Limits requests per minute per user
 */
export const rateLimiter = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get rate limit from settings
    const settings = await SystemSettings.findOne();
    const rateLimit = settings?.apiRateLimit || 100; // Default 100 requests/minute

    // Get user identifier (user ID or IP address)
    const identifier = req.user?._id?.toString() || req.ip || 'anonymous';

    // Get current time
    const now = Date.now();
    const oneMinute = 60 * 1000; // 60 seconds

    // Get or create request count for this identifier
    let userRequests = requestCounts.get(identifier);

    // Reset if time window has passed
    if (!userRequests || now > userRequests.resetTime) {
      userRequests = {
        count: 0,
        resetTime: now + oneMinute,
      };
      requestCounts.set(identifier, userRequests);
    }

    // Increment request count
    userRequests.count++;

    // Check if rate limit exceeded
    if (userRequests.count > rateLimit) {
      const resetIn = Math.ceil((userRequests.resetTime - now) / 1000);

      res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Please try again in ${resetIn} seconds.`,
        rateLimit: {
          limit: rateLimit,
          remaining: 0,
          resetIn: resetIn,
        },
      });
      return;
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', rateLimit.toString());
    res.setHeader('X-RateLimit-Remaining', (rateLimit - userRequests.count).toString());
    res.setHeader('X-RateLimit-Reset', userRequests.resetTime.toString());

    next();
  } catch (error) {
    // Don't block request if rate limit check fails
    console.error('Error in rate limiter:', error);
    next();
  }
};

/**
 * Clean up old entries from requestCounts map
 * Call this periodically to prevent memory leaks
 */
export const cleanupRateLimitStore = (): void => {
  const now = Date.now();
  for (const [identifier, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(identifier);
    }
  }
};

// Clean up every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
