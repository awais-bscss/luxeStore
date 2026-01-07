import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import {
  USER_ROLES,
  UserRole,
  hasPermission,
  canAccessResource,
  ROLE_HIERARCHY,
} from '../constants';
import type { Resource, Action } from '../constants';

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Access denied. Required role: ${roles.join(' or ')}`
      );
    }

    next();
  };
};

export const requireMinRole = (minRole: UserRole) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const userRoleLevel = ROLE_HIERARCHY[req.user.role];
    const requiredRoleLevel = ROLE_HIERARCHY[minRole];

    if (userRoleLevel < requiredRoleLevel) {
      throw new ForbiddenError(
        `Access denied. Minimum required role: ${minRole}`
      );
    }

    next();
  };
};

export const requirePermission = (resource: Resource, action: Action) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!hasPermission(req.user.role, resource, action)) {
      throw new ForbiddenError(
        `You don't have permission to ${action} ${resource}`
      );
    }

    next();
  };
};

export const requireResourceAccess = (resource: Resource) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!canAccessResource(req.user.role, resource)) {
      throw new ForbiddenError(
        `You don't have access to ${resource}`
      );
    }

    next();
  };
};

export const isSuperAdmin = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (req.user.role !== USER_ROLES.SUPER_ADMIN) {
    throw new ForbiddenError('Super Admin access required');
  }

  next();
};

export const isAdmin = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.SUPER_ADMIN) {
    throw new ForbiddenError('Admin access required');
  }

  next();
};

export const isAdminOrOwner = (getUserId: (req: AuthRequest) => string) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const isAdminRole = req.user.role === USER_ROLES.ADMIN || req.user.role === USER_ROLES.SUPER_ADMIN;
    const isOwner = req.user._id === getUserId(req);

    if (!isAdminRole && !isOwner) {
      throw new ForbiddenError('Access denied. Admin privileges or ownership required');
    }

    next();
  };
};
