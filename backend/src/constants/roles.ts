export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'superadmin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_HIERARCHY = {
  [USER_ROLES.USER]: 0,
  [USER_ROLES.ADMIN]: 1,
  [USER_ROLES.SUPER_ADMIN]: 2,
} as const;
