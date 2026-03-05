import apiService from './api';
import type { User, UserWithRoles, PaginatedResponse, PaginationParams, UserRole } from '@/types';

/**
 * User Service
 * API calls for user management
 */
export const userService = {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserWithRoles> {
    const response = await apiService.get<UserWithRoles>('/users/me');
    return response.data;
  },

  /**
   * Provision user on first login (auto-provisioning)
   */
  async provisionUser(): Promise<User> {
    const response = await apiService.post<User>('/users/provision');
    return response.data;
  },

  /**
   * Get all users with pagination
   */
  async getUsers(params?: PaginationParams): Promise<PaginatedResponse<UserWithRoles>> {
    return apiService.getPaginated<UserWithRoles>('/admin/users', params);
  },

  /**
   * Get a single user by ID
   */
  async getUser(id: string): Promise<UserWithRoles> {
    const response = await apiService.get<UserWithRoles>(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Update user roles
   */
  async updateUserRoles(id: string, roles: UserRole[]): Promise<User> {
    const response = await apiService.patch<User>(`/admin/users/${id}/roles`, { roles });
    return response.data;
  },

  /**
   * Update user building access
   */
  async updateBuildingAccess(
    userId: string,
    buildingAccess: { buildingId: string; accessLevel: 'view' | 'admin' }[]
  ): Promise<User> {
    const response = await apiService.patch<User>(`/admin/users/${userId}/buildings`, {
      buildingAccess,
    });
    return response.data;
  },

  /**
   * Deactivate a user
   */
  async deactivateUser(id: string): Promise<User> {
    const response = await apiService.patch<User>(`/admin/users/${id}/deactivate`);
    return response.data;
  },

  /**
   * Reactivate a user
   */
  async reactivateUser(id: string): Promise<User> {
    const response = await apiService.patch<User>(`/admin/users/${id}/reactivate`);
    return response.data;
  },
};

export default userService;
