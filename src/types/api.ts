/**
 * API Response Types
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ApiError[];
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Common Filter Types
 */
export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}

export interface TimeSeriesParams extends DateRangeFilter {
  aggregation?: 'raw' | 'minute' | 'hour' | 'day' | 'week' | 'month';
  ptagIds?: string[];
  vtagIds?: string[];
  buildingIds?: string[];
}
