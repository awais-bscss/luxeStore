import { USER_ROLES, UserRole } from './roles';

export const RESOURCES = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CUSTOMERS: 'customers',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
} as const;

export type Resource = typeof RESOURCES[keyof typeof RESOURCES];

export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
} as const;

export type Action = typeof ACTIONS[keyof typeof ACTIONS];

export interface Permission {
  resource: Resource;
  actions: Action[];
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [USER_ROLES.USER]: [],

  [USER_ROLES.ADMIN]: [
    {
      resource: RESOURCES.PRODUCTS,
      actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
    },
    {
      resource: RESOURCES.ORDERS,
      actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
    },
    {
      resource: RESOURCES.CUSTOMERS,
      actions: [ACTIONS.READ],
    },
  ],

  [USER_ROLES.SUPER_ADMIN]: [
    {
      resource: RESOURCES.PRODUCTS,
      actions: [ACTIONS.MANAGE],
    },
    {
      resource: RESOURCES.ORDERS,
      actions: [ACTIONS.MANAGE],
    },
    {
      resource: RESOURCES.CUSTOMERS,
      actions: [ACTIONS.MANAGE],
    },
    {
      resource: RESOURCES.ANALYTICS,
      actions: [ACTIONS.MANAGE],
    },
    {
      resource: RESOURCES.SETTINGS,
      actions: [ACTIONS.MANAGE],
    },
  ],
};

export const hasPermission = (
  role: UserRole,
  resource: Resource,
  action: Action
): boolean => {
  const permissions = ROLE_PERMISSIONS[role];

  if (!permissions) return false;

  for (const permission of permissions) {
    if (permission.resource === resource) {
      if (permission.actions.includes(ACTIONS.MANAGE)) {
        return true;
      }
      if (permission.actions.includes(action)) {
        return true;
      }
    }
  }

  return false;
};

export const canAccessResource = (
  role: UserRole,
  resource: Resource
): boolean => {
  const permissions = ROLE_PERMISSIONS[role];

  if (!permissions) return false;

  return permissions.some(p => p.resource === resource);
};

export const getResourceActions = (
  role: UserRole,
  resource: Resource
): Action[] => {
  const permissions = ROLE_PERMISSIONS[role];

  if (!permissions) return [];

  const permission = permissions.find(p => p.resource === resource);

  if (!permission) return [];

  if (permission.actions.includes(ACTIONS.MANAGE)) {
    return [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE];
  }

  return permission.actions;
};
