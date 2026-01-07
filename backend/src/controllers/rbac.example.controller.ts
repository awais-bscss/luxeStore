import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { asyncHandler } from '../utils/asyncHandler';
import { ForbiddenError } from '../utils/errors';
import { RESOURCES, ACTIONS, hasPermission } from '../constants';
import { PermissionHelper, isAdminOrOwner } from '../utils/permissionHelpers';

/**
 * Example controller demonstrating RBAC usage
 */

// Example: Get user profile
// - Users can view their own profile
// - Admins can view any profile (read-only)
// - SuperAdmins can view any profile
export const getUserProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const currentUser = req.user!;

    // Check if user is viewing their own profile or has permission
    const canView =
      currentUser._id === userId ||
      hasPermission(currentUser.role, RESOURCES.CUSTOMERS, ACTIONS.READ);

    if (!canView) {
      throw new ForbiddenError('You can only view your own profile');
    }

    // Fetch user logic here
    res.status(200).json({
      success: true,
      message: 'User profile retrieved',
      data: { userId },
    });
  }
);

// Example: Update user profile
// - Users can update their own profile
// - SuperAdmins can update any profile
export const updateUserProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const currentUser = req.user!;

    // Check if user can update this profile
    const canUpdate = isAdminOrOwner(
      currentUser.role,
      currentUser._id,
      userId
    );

    if (!canUpdate) {
      throw new ForbiddenError('You can only update your own profile');
    }

    // Update user logic here
    res.status(200).json({
      success: true,
      message: 'User profile updated',
      data: { userId },
    });
  }
);

// Example: Delete user
// - Only SuperAdmins can delete users
export const deleteUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const currentUser = req.user!;

    // Only SuperAdmin can delete users
    if (!PermissionHelper.isSuperAdmin(currentUser.role)) {
      throw new ForbiddenError('Only Super Admins can delete users');
    }

    // Prevent SuperAdmin from deleting themselves
    if (currentUser._id === userId) {
      throw new ForbiddenError('You cannot delete your own account');
    }

    // Delete user logic here
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  }
);

// Example: Change user role
// - Only SuperAdmins can change user roles
export const changeUserRole = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const { newRole } = req.body;
    const currentUser = req.user!;

    // Only SuperAdmin can change roles
    if (!PermissionHelper.isSuperAdmin(currentUser.role)) {
      throw new ForbiddenError('Only Super Admins can change user roles');
    }

    // Validate role transition
    const validation = PermissionHelper.validateRoleTransition(
      currentUser.role, // Assuming we fetch the target user's current role
      newRole,
      currentUser.role
    );

    if (!validation.allowed) {
      throw new ForbiddenError(validation.reason || 'Invalid role transition');
    }

    // Update role logic here
    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: { userId, newRole },
    });
  }
);

// Example: Get analytics data
// - Only SuperAdmins can access analytics
export const getAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const currentUser = req.user!;

    // Check if user has permission to view analytics
    if (!hasPermission(currentUser.role, RESOURCES.ANALYTICS, ACTIONS.READ)) {
      throw new ForbiddenError('You do not have access to analytics');
    }

    // Fetch analytics logic here
    res.status(200).json({
      success: true,
      message: 'Analytics data retrieved',
      data: {
        totalUsers: 100,
        totalOrders: 50,
        revenue: 10000,
      },
    });
  }
);

// Example: Conditional data based on role
export const getDashboardData = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const currentUser = req.user!;

    const dashboardData: any = {
      role: currentUser.role,
      roleName: PermissionHelper.getRoleName(currentUser.role),
      roleDescription: PermissionHelper.getRoleDescription(currentUser.role),
    };

    // Add products section if user has access
    if (hasPermission(currentUser.role, RESOURCES.PRODUCTS, ACTIONS.READ)) {
      dashboardData.products = {
        canCreate: hasPermission(currentUser.role, RESOURCES.PRODUCTS, ACTIONS.CREATE),
        canUpdate: hasPermission(currentUser.role, RESOURCES.PRODUCTS, ACTIONS.UPDATE),
        canDelete: hasPermission(currentUser.role, RESOURCES.PRODUCTS, ACTIONS.DELETE),
      };
    }

    // Add orders section if user has access
    if (hasPermission(currentUser.role, RESOURCES.ORDERS, ACTIONS.READ)) {
      dashboardData.orders = {
        canCreate: hasPermission(currentUser.role, RESOURCES.ORDERS, ACTIONS.CREATE),
        canUpdate: hasPermission(currentUser.role, RESOURCES.ORDERS, ACTIONS.UPDATE),
        canDelete: hasPermission(currentUser.role, RESOURCES.ORDERS, ACTIONS.DELETE),
      };
    }

    // Add customers section if user has access
    if (hasPermission(currentUser.role, RESOURCES.CUSTOMERS, ACTIONS.READ)) {
      dashboardData.customers = {
        canCreate: hasPermission(currentUser.role, RESOURCES.CUSTOMERS, ACTIONS.CREATE),
        canUpdate: hasPermission(currentUser.role, RESOURCES.CUSTOMERS, ACTIONS.UPDATE),
        canDelete: hasPermission(currentUser.role, RESOURCES.CUSTOMERS, ACTIONS.DELETE),
        readOnly: !hasPermission(currentUser.role, RESOURCES.CUSTOMERS, ACTIONS.UPDATE),
      };
    }

    // Add analytics section if user has access
    if (hasPermission(currentUser.role, RESOURCES.ANALYTICS, ACTIONS.READ)) {
      dashboardData.analytics = {
        hasAccess: true,
      };
    }

    // Add settings section if user has access
    if (hasPermission(currentUser.role, RESOURCES.SETTINGS, ACTIONS.READ)) {
      dashboardData.settings = {
        canUpdate: hasPermission(currentUser.role, RESOURCES.SETTINGS, ACTIONS.UPDATE),
      };
    }

    res.status(200).json({
      success: true,
      message: 'Dashboard data retrieved',
      data: dashboardData,
    });
  }
);
