import {
  USER_ROLES,
  UserRole,
  ROLE_HIERARCHY,
  hasPermission,
  canAccessResource,
  getResourceActions,
  Resource,
  Action,
} from '../constants';

export class PermissionHelper {
  static isUser(role: UserRole): boolean {
    return role === USER_ROLES.USER;
  }

  static isAdmin(role: UserRole): boolean {
    return role === USER_ROLES.ADMIN;
  }

  static isSuperAdmin(role: UserRole): boolean {
    return role === USER_ROLES.SUPER_ADMIN;
  }

  static isAdminOrAbove(role: UserRole): boolean {
    return (
      role === USER_ROLES.ADMIN || role === USER_ROLES.SUPER_ADMIN
    );
  }

  static hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
  }

  static hasHigherRole(role1: UserRole, role2: UserRole): boolean {
    return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
  }

  static canPerformAction(
    role: UserRole,
    resource: Resource,
    action: Action
  ): boolean {
    return hasPermission(role, resource, action);
  }

  static canAccessResource(role: UserRole, resource: Resource): boolean {
    return canAccessResource(role, resource);
  }

  static getAvailableActions(role: UserRole, resource: Resource): Action[] {
    return getResourceActions(role, resource);
  }

  static getRoleLevel(role: UserRole): number {
    return ROLE_HIERARCHY[role];
  }

  static getAllowedRoles(minRole: UserRole): UserRole[] {
    const minLevel = ROLE_HIERARCHY[minRole];
    return Object.entries(ROLE_HIERARCHY)
      .filter(([_, level]) => level >= minLevel)
      .map(([role]) => role as UserRole);
  }

  static getRoleName(role: UserRole): string {
    const roleNames: Record<UserRole, string> = {
      [USER_ROLES.USER]: 'User',
      [USER_ROLES.ADMIN]: 'Admin',
      [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
    };
    return roleNames[role] || 'Unknown';
  }

  static getRoleDescription(role: UserRole): string {
    const descriptions: Record<UserRole, string> = {
      [USER_ROLES.USER]: 'Regular customer with basic access',
      [USER_ROLES.ADMIN]:
        'Store administrator with product and order management access',
      [USER_ROLES.SUPER_ADMIN]:
        'Full system access including analytics and settings',
    };
    return descriptions[role] || 'No description available';
  }

  static validateRoleTransition(
    currentRole: UserRole,
    newRole: UserRole,
    performedByRole: UserRole
  ): { allowed: boolean; reason?: string } {
    if (currentRole === newRole) {
      return { allowed: false, reason: 'Role is already set to this value' };
    }

    if (!this.isSuperAdmin(performedByRole)) {
      return {
        allowed: false,
        reason: 'Only Super Admins can change user roles',
      };
    }

    if (this.isSuperAdmin(currentRole) && !this.isSuperAdmin(performedByRole)) {
      return {
        allowed: false,
        reason: 'Cannot modify Super Admin role',
      };
    }

    return { allowed: true };
  }
}

export const isOwner = (userId: string, resourceOwnerId: string): boolean => {
  return userId === resourceOwnerId;
};

export const isAdminOrOwner = (
  role: UserRole,
  userId: string,
  resourceOwnerId: string
): boolean => {
  return PermissionHelper.isAdminOrAbove(role) || isOwner(userId, resourceOwnerId);
};

export const canModifyResource = (
  role: UserRole,
  userId: string,
  resourceOwnerId: string,
  resource: Resource,
  action: Action
): boolean => {
  const hasPermissionToModify = hasPermission(role, resource, action);
  const isResourceOwner = isOwner(userId, resourceOwnerId);

  return hasPermissionToModify || isResourceOwner;
};
