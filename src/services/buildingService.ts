import apiService from './api';
import type { Building, BuildingWithStats, PaginatedResponse, PaginationParams } from '@/types';

/**
 * Building Service
 * API calls for building-related operations
 */
export const buildingService = {
  /**
   * Get all buildings with pagination
   */
  async getBuildings(params?: PaginationParams): Promise<PaginatedResponse<Building>> {
    return apiService.getPaginated<Building>('/buildings', params);
  },

  /**
   * Get buildings with stats (for dashboard)
   */
  async getBuildingsWithStats(): Promise<BuildingWithStats[]> {
    const response = await apiService.get<BuildingWithStats[]>('/buildings/stats');
    return response.data;
  },

  /**
   * Get a single building by ID
   */
  async getBuilding(id: string): Promise<Building> {
    const response = await apiService.get<Building>(`/buildings/${id}`);
    return response.data;
  },

  /**
   * Create a new building
   */
  async createBuilding(data: Partial<Building>): Promise<Building> {
    const response = await apiService.post<Building>('/buildings', data);
    return response.data;
  },

  /**
   * Update a building
   */
  async updateBuilding(id: string, data: Partial<Building>): Promise<Building> {
    const response = await apiService.put<Building>(`/buildings/${id}`, data);
    return response.data;
  },

  /**
   * Delete a building
   */
  async deleteBuilding(id: string): Promise<void> {
    await apiService.delete(`/buildings/${id}`);
  },
};

export default buildingService;
