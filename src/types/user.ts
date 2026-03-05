/**
 * User Types and Interfaces
 */

export type UserRole = 'super_admin' | 'building_admin' | 'user';

export interface User {
  id: string;
  entraObjectId: string;
  email: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  roles: UserRole[];
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithRoles extends User {
  roleDetails: Role[];
  buildingAccess: BuildingAccess[];
}

export interface Role {
  id: string;
  name: UserRole;
  displayName: string;
  description: string;
  permissions: string[];
}

export interface BuildingAccess {
  buildingId: string;
  buildingName: string;
  accessLevel: 'view' | 'admin';
}

export interface UserAuditLog {
  id: string;
  userId: string;
  action: string;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

/**
 * Authentication Types
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
