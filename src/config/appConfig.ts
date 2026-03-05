/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  TIMEOUT: 30000,
};

/**
 * Dashboard Configuration
 */
export const DASHBOARD_CONFIG = {
  GRID_COLS: 12,
  ROW_HEIGHT: 100,
  WIDGET_MARGIN: [16, 16] as [number, number],
  CONTAINER_PADDING: [16, 16] as [number, number],
  MIN_WIDGET_WIDTH: 2,
  MIN_WIDGET_HEIGHT: 2,
};

/**
 * Chart Refresh Intervals (in milliseconds)
 */
export const REFRESH_INTERVALS = {
  REAL_TIME: 10000, // 10 seconds
  NEAR_REAL_TIME: 60000, // 1 minute
  STANDARD: 300000, // 5 minutes
  SLOW: 900000, // 15 minutes
};

/**
 * Date Range Presets
 */
export const DATE_RANGE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: 'last7days' },
  { label: 'Last 30 Days', value: 'last30days' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Year', value: 'thisYear' },
  { label: 'Custom', value: 'custom' },
] as const;

/**
 * Widget Types
 */
export const WIDGET_TYPES = {
  LINE_CHART: 'line',
  BAR_CHART: 'bar',
  PIE_CHART: 'pie',
  SCATTER_CHART: 'scatter',
  HEATMAP: 'heatmap',
  KPI_CARD: 'kpi',
  TABLE: 'table',
  GAUGE: 'gauge',
} as const;

/**
 * User Roles
 */
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  BUILDING_ADMIN: 'building_admin',
  USER: 'user',
} as const;
