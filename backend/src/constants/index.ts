export { USER_ROLES, ROLE_HIERARCHY } from './roles';
export type { UserRole } from './roles';

export {
  RESOURCES,
  ACTIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  canAccessResource,
  getResourceActions,
} from './permissions';
export type { Resource, Action, Permission } from './permissions';
