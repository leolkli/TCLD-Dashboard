/**
 * Widget Configuration Types
 * Modeled after TradingView's Symbol Overview settings panel.
 * Each section maps to a collapsible settings accordion in the Widget Configurator.
 */

import type { SynapsePTag } from './synapse';

// ─── Chart Types ───────────────────────────────────────────────
export type WidgetChartType = 'line' | 'area' | 'bar' | 'candlestick' | 'scatter' | 'pie' | 'heatmap' | 'kpi' | 'table';
export type AggregationInterval = 'raw' | 'hourly' | 'daily' | 'weekly' | 'monthly';
export type DateRangePreset = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL' | 'custom';
export type HeaderFontSize = 'small' | 'medium' | 'large';
export type ScaleType = 'linear' | 'log';
export type ComparisonMode = 'same-axis' | 'dual-axis';

// ─── Selected Data Point (like TradingView symbol pill) ────────
export interface SelectedDataPoint {
  code: string;          // DW_D_EAPtag.Code
  name: string;          // Display name (DW_D_EAPtag.Name)
  building: string;      // Building code
  system: string;        // System category
  uom: string;           // Unit of measure
  commodity: string;     // Commodity type
  color: string;         // Auto-assigned from chartColors
  axisIndex: number;     // 0 = left, 1 = right (for dual-axis comparison)
  axis?: 'x' | 'y';
}

// ─── Size Settings ─────────────────────────────────────────────
export interface SizeConfig {
  useContainerSize: boolean;
  width: string;         // '100%' or '500px'
  height: string;        // '100%' or '400px'
  gridColSpan?: number;  // 2-12 for react-grid-layout
}

// ─── Date Range Settings ───────────────────────────────────────
export interface DateRangeConfig {
  preset: DateRangePreset | null;
  customStart?: string;  // ISO date string
  customEnd?: string;    // ISO date string
  aggregation: AggregationInterval;
}

// ─── General Settings ──────────────────────────────────────────
export interface GeneralConfig {
  title: string;
  description?: string;
  refreshInterval: number; // seconds
}

// ─── Header Settings ───────────────────────────────────────────
export interface HeaderConfig {
  visible: boolean;
  fontSize: HeaderFontSize;
  showLastValue: boolean;
  showChangePercent: boolean;
}

// ─── Chart Settings ────────────────────────────────────────────
export type DataRelationship = 'none' | 'single-metric' | 'change-over-time' | 'comparing-categories' | 'part-of-whole' | 'correlation';
export type PieLayout = 'pie' | 'donut';
export type BarLayout = 'horizontal' | 'grouped' | 'stacked';

export interface ChartConfig {
  type: WidgetChartType;
  lineWidth: number;
  fillOpacity: number;
  showGridLines: boolean;
  backgroundColor: string;
  upColor: string;
  downColor: string;
  showDataLabels?: boolean;
  showTrendline?: boolean;
  pieLayout?: PieLayout;
  barLayout?: BarLayout;
  scatterPointMinSize?: number;
  scatterPointMaxSize?: number;
  relationship?: DataRelationship;
}

// ─── Comparison / Indicators Settings ──────────────────────────
export interface ComparisonConfig {
  baseline?: any;
  target?: any;
  enabled: boolean;
  mode: ComparisonMode;
  showVolume: boolean;
}

// ─── Scales Settings ───────────────────────────────────────────
export interface ScalesConfig {
  yAxisMode: 'auto' | 'manual';
  yMin?: number;
  yMax?: number;
  xAxisMode?: 'auto' | 'manual';
  xMin?: number;
  xMax?: number;
  scaleType: ScaleType;
  showPriceScale: boolean;
  precision: number;
}

// ─── Widget Scope ──────────────────────────────────────────────
export type WidgetScope = 'building' | 'portfolio';

// ─── Core Widget Configuration ─────────────────────────────────
export interface WidgetConfiguration {
  id?: string;
  name: string;
  widgetScope: WidgetScope;   // 'building' or 'portfolio'
  buildingCode: string;       // DW_D_BuildingName.BuildingCode
  buildingName: string;       // DW_D_BuildingName.BuildingName
  portfolioName?: string;     // DW_D_Portfolio_New.PortfolioName (when widgetScope = 'portfolio')
  dataPoints: SelectedDataPoint[];
  size: SizeConfig;
  dateRange: DateRangeConfig;
  general: GeneralConfig;
  header: HeaderConfig;
  chart: ChartConfig;
  comparison: ComparisonConfig;
  scales: ScalesConfig;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Default Configuration ─────────────────────────────────────
export const DEFAULT_WIDGET_CONFIG: WidgetConfiguration = {
  name: 'New Widget',
  widgetScope: 'building',
  buildingCode: '',
  buildingName: '',
  portfolioName: '',
  dataPoints: [],
  size: {
    useContainerSize: true,
    width: '100%',
    height: '100%',
  },
  dateRange: {
    preset: '1M',
    aggregation: 'daily',
  },
  general: {
    title: 'New Widget',
    refreshInterval: 300,
  },
  header: {
    visible: true,
    fontSize: 'medium',
    showLastValue: true,
    showChangePercent: true,
  },
  chart: {
    type: 'line',
    lineWidth: 2,
    fillOpacity: 30,
    showGridLines: true,
    backgroundColor: '#ffffff',
    upColor: '#22ab94',
    downColor: '#f7525f',
  },
  comparison: {
    enabled: false,
    mode: 'same-axis',
    showVolume: false,
  },
  scales: {
    yAxisMode: 'auto',
    scaleType: 'linear',
    showPriceScale: true,
    precision: 2,
  },
};

// ─── API Types ─────────────────────────────────────────────────
export interface BuildingListItem {
  code: string;          // DW_D_BuildingName.BuildingCode
  name: string;          // DW_D_BuildingName.BuildingName
}

export interface TagSearchParams {
  building?: string;
  system?: string;
  commodity?: string;
  q?: string;
  limit?: number;
}

export interface TagSearchResult {
  tags: (SynapsePTag & { Building?: string })[];
  total: number;
}

export interface TagFilterOptions {
  systems: string[];
  commodities: string[];
  buildings: string[];
}

export interface MultiSeriesResponse {
  series: {
    code: string;
    uom: string;
    tableName: string;
    data: { timestamp: string; value: number }[];
  }[];
}

export interface SeriesDataMap {
  [code: string]: { timestamp: string; value: number }[];
}
