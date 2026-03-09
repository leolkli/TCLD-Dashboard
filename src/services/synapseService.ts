
import apiService from './api';
import { SynapsePortfolio, BuildingTagsResponse } from '@/types/synapse';
import type {
  TagSearchParams,
  TagSearchResult,
  TagFilterOptions,
  MultiSeriesResponse,
  AggregationInterval,
  BuildingListItem,
  WidgetConfiguration,
} from '@/types/widget';
import type { Dashboard } from '@/types/dashboard';

export interface Reading {
  timestamp: string;
  value: number;
}

export interface ReadingsResponse {
  code: string;
  uom: string;
  tableName: string;
  count: number;
  data: Reading[];
}

export const synapseService = {
  getHierarchy: async (): Promise<SynapsePortfolio[]> => {
    try {
      const response = await apiService.get<SynapsePortfolio[]>('/hierarchy');
      return response.data;
    } catch (e) {
      console.warn("SynapseService: API call failed, throwing for caller to handle backup.", e);
      throw e;
    }
  },

  getBuildingTags: async (buildingCode: string): Promise<BuildingTagsResponse> => {
    const response = await apiService.get<BuildingTagsResponse>(`/buildings/${buildingCode}/tags`);
    return response.data;
  },

  getReadings: async (code: string, startDate?: string, endDate?: string): Promise<ReadingsResponse> => {
    const params = new URLSearchParams();
    params.append('code', code);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiService.get<ReadingsResponse>(`/readings?${params.toString()}`);
    return response.data;
  },

  /**
   * Get all buildings from DW_D_BuildingName.
   */
  getBuildings: async (): Promise<BuildingListItem[]> => {
    const response = await apiService.get<BuildingListItem[]>('/buildings/list');
    return response.data;
  },

  /**
   * Search tags in DW_D_EAPtag with filters.
   */
  searchTags: async (params: TagSearchParams): Promise<TagSearchResult> => {
    const qs = new URLSearchParams();
    if (params.q) qs.append('q', params.q);
    if (params.building) qs.append('building', params.building);
    if (params.system) qs.append('system', params.system);
    if (params.commodity) qs.append('commodity', params.commodity);
    if (params.limit) qs.append('limit', String(params.limit));

    const response = await apiService.get<TagSearchResult>(`/tags/search?${qs.toString()}`);
    return response.data;
  },

  /**
   * Get distinct filter options for tags (systems, commodities, buildings).
   */
  getTagFilterOptions: async (): Promise<TagFilterOptions> => {
    const response = await apiService.get<TagFilterOptions>('/tags/filters');
    return response.data;
  },

  /**
   * Fetch time-series data for multiple tags.
   */
  getMultiReadings: async (
    codes: string[],
    startDate?: string,
    endDate?: string,
    limit?: number,
    aggregation?: AggregationInterval,
  ): Promise<MultiSeriesResponse> => {
    const qs = new URLSearchParams();
    qs.append('codes', codes.join(','));
    if (startDate) qs.append('startDate', startDate);
    if (endDate) qs.append('endDate', endDate);
    if (limit) qs.append('limit', String(limit));
    if (aggregation) qs.append('aggregation', aggregation);

    try {
      const response = await apiService.get<MultiSeriesResponse>(`/readings?${qs.toString()}`);
      return response.data;
    } catch (error) {
      // Mock Fallback for design phase
      console.warn('API call failed, generating mock multi-readings for', codes);
      const points = limit || 24;
      return {
        series: codes.map((code) => {
          const data = [];
          const now = new Date(endDate || Date.now());
          const start = new Date(startDate || now.getTime() - 24 * 60 * 60 * 1000);
          const step = (now.getTime() - start.getTime()) / points;
          
          let lastVal = 50 + Math.random() * 50;
          for (let i = 0; i < points; i++) {
            lastVal += (Math.random() - 0.5) * 10;
            data.push({
              timestamp: new Date(start.getTime() + i * step).toISOString(),
              value: Math.max(0, lastVal)
            });
          }
          return {
            code,
            uom: 'kW',
            tableName: 'MockTable',
            data
          };
        })
      };
    }
  },

  // ── Saved Widgets CRUD ─────────────────────────────────────────

  getWidgets: async (buildingCode?: string): Promise<WidgetConfiguration[]> => {
    const qs = buildingCode ? `?building=${encodeURIComponent(buildingCode)}` : '';
    const response = await apiService.get<WidgetConfiguration[]>(`/widgets${qs}`);
    return response.data;
  },

  getWidget: async (id: string): Promise<WidgetConfiguration> => {
    const response = await apiService.get<WidgetConfiguration>(`/widgets/${id}`);
    return response.data;
  },

  saveWidget: async (widget: WidgetConfiguration): Promise<WidgetConfiguration> => {
    if (widget.id) {
      const response = await apiService.put<WidgetConfiguration>(`/widgets/${widget.id}`, widget);
      return response.data;
    }
    const response = await apiService.post<WidgetConfiguration>('/widgets', widget);
    return response.data;
  },

  deleteWidget: async (id: string): Promise<void> => {
    await apiService.delete(`/widgets/${id}`);
  },

  // ── Dashboards CRUD ────────────────────────────────────────────

  getDashboards: async (params?: {
    scope?: string;
    building?: string;
    portfolio?: string;
  }): Promise<Dashboard[]> => {
    const qs = new URLSearchParams();
    if (params?.scope) qs.append('scope', params.scope);
    if (params?.building) qs.append('building', params.building);
    if (params?.portfolio) qs.append('portfolio', params.portfolio);
    const q = qs.toString();
    const response = await apiService.get<Dashboard[]>(`/dashboards${q ? `?${q}` : ''}`);
    return response.data;
  },

  getDashboard: async (id: string): Promise<Dashboard> => {
    const response = await apiService.get<Dashboard>(`/dashboards/${id}`);
    return response.data;
  },

  saveDashboard: async (dashboard: Dashboard): Promise<Dashboard> => {
    // Try update first if it has an id and exists
    try {
      const response = await apiService.put<Dashboard>(`/dashboards/${dashboard.id}`, dashboard);
      return response.data;
    } catch {
      // If 404, create new
      const response = await apiService.post<Dashboard>('/dashboards', dashboard);
      return response.data;
    }
  },

  deleteDashboard: async (id: string): Promise<void> => {
    await apiService.delete(`/dashboards/${id}`);
  },
};
