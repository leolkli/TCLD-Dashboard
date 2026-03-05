import { create } from 'zustand';
import dayjs from 'dayjs';
import type {
  WidgetConfiguration,
  SelectedDataPoint,
  SizeConfig,
  DateRangeConfig,
  GeneralConfig,
  HeaderConfig,
  ChartConfig,
  ComparisonConfig,
  ScalesConfig,
  TagFilterOptions,
  SeriesDataMap,
  AggregationInterval,
  DateRangePreset,
  BuildingListItem,
} from '@/types/widget';
import { DEFAULT_WIDGET_CONFIG } from '@/types/widget';
import { chartColors } from '@/theme';
import { synapseService } from '@/services/synapseService';

// ─── Helper: compute date range from preset ────────────────────
function getDateRangeFromPreset(preset: DateRangePreset | null): { start?: string; end?: string } {
  if (!preset || preset === 'custom') return {};
  const end = dayjs().toISOString();
  const presetMap: Record<string, number> = {
    '1D': 1,
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
  };
  const days = presetMap[preset];
  if (!days) return {}; // ALL
  return { start: dayjs().subtract(days, 'day').toISOString(), end };
}

// ─── Store Interface ───────────────────────────────────────────
interface WidgetConfigState {
  config: WidgetConfiguration;
  previewData: SeriesDataMap;
  filterOptions: TagFilterOptions;
  buildings: BuildingListItem[];
  isLoading: boolean;
  error: string | null;
  activeSettingsTab: number;

  // Config updaters
  setConfig: (config: Partial<WidgetConfiguration>) => void;
  resetConfig: () => void;
  setBuilding: (code: string, name: string) => void;
  setPortfolio: (name: string) => void;
  addDataPoint: (dp: SelectedDataPoint) => void;
  removeDataPoint: (code: string) => void;
  updateDataPointColor: (code: string, color: string) => void;
  updateSize: (size: Partial<SizeConfig>) => void;
  updateDateRange: (dateRange: Partial<DateRangeConfig>) => void;
  updateGeneral: (general: Partial<GeneralConfig>) => void;
  updateHeader: (header: Partial<HeaderConfig>) => void;
  updateChart: (chart: Partial<ChartConfig>) => void;
  updateComparison: (comparison: Partial<ComparisonConfig>) => void;
  updateScales: (scales: Partial<ScalesConfig>) => void;

  // Data fetching
  fetchPreviewData: () => Promise<void>;
  fetchFilterOptions: () => Promise<void>;
  fetchBuildings: () => Promise<void>;

  // Persistence
  saveWidget: () => Promise<void>;

  // UI state
  setActiveSettingsTab: (tab: number) => void;
}

export const useWidgetConfigStore = create<WidgetConfigState>((set, get) => ({
  config: { ...DEFAULT_WIDGET_CONFIG },
  previewData: {},
  filterOptions: { systems: [], commodities: [], buildings: [] },
  buildings: [],
  isLoading: false,
  error: null,
  activeSettingsTab: 0,

  setConfig: (partial) =>
    set((state) => ({ config: { ...state.config, ...partial } })),

  resetConfig: () =>
    set({ config: { ...DEFAULT_WIDGET_CONFIG }, previewData: {}, error: null }),

  setBuilding: (code, name) =>
    set((state) => ({
      config: {
        ...state.config,
        widgetScope: 'building' as const,
        buildingCode: code,
        buildingName: name,
        portfolioName: '',
        // Clear data points when building changes
        dataPoints: [],
      },
      previewData: {},
    })),

  setPortfolio: (name) =>
    set((state) => ({
      config: {
        ...state.config,
        widgetScope: 'portfolio' as const,
        portfolioName: name,
        buildingCode: '',
        buildingName: '',
        // Clear data points when portfolio changes
        dataPoints: [],
      },
      previewData: {},
    })),

  addDataPoint: (dp) =>
    set((state) => {
      const existing = state.config.dataPoints;
      if (existing.find((p) => p.code === dp.code)) return state; // duplicate guard
      // Auto-assign chart color
      const colorIndex = existing.length % chartColors.primary.length;
      const newDp = { ...dp, color: dp.color || chartColors.primary[colorIndex], axisIndex: 0 };
      return {
        config: {
          ...state.config,
          dataPoints: [...existing, newDp],
        },
      };
    }),

  removeDataPoint: (code) =>
    set((state) => ({
      config: {
        ...state.config,
        dataPoints: state.config.dataPoints.filter((p) => p.code !== code),
      },
    })),

  updateDataPointColor: (code, color) =>
    set((state) => ({
      config: {
        ...state.config,
        dataPoints: state.config.dataPoints.map((p) =>
          p.code === code ? { ...p, color } : p,
        ),
      },
    })),

  updateSize: (size) =>
    set((state) => ({ config: { ...state.config, size: { ...state.config.size, ...size } } })),

  updateDateRange: (dateRange) =>
    set((state) => ({
      config: { ...state.config, dateRange: { ...state.config.dateRange, ...dateRange } },
    })),

  updateGeneral: (general) =>
    set((state) => ({ config: { ...state.config, general: { ...state.config.general, ...general } } })),

  updateHeader: (header) =>
    set((state) => ({ config: { ...state.config, header: { ...state.config.header, ...header } } })),

  updateChart: (chart) =>
    set((state) => ({ config: { ...state.config, chart: { ...state.config.chart, ...chart } } })),

  updateComparison: (comparison) =>
    set((state) => ({
      config: { ...state.config, comparison: { ...state.config.comparison, ...comparison } },
    })),

  updateScales: (scales) =>
    set((state) => ({ config: { ...state.config, scales: { ...state.config.scales, ...scales } } })),

  fetchPreviewData: async () => {
    const { config } = get();
    if (config.dataPoints.length === 0) {
      set({ previewData: {}, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const codes = config.dataPoints.map((dp) => dp.code);
      const { start, end } = config.dateRange.preset === 'custom'
        ? { start: config.dateRange.customStart, end: config.dateRange.customEnd }
        : getDateRangeFromPreset(config.dateRange.preset);

      const response = await synapseService.getMultiReadings(
        codes,
        start,
        end,
        1000,
        config.dateRange.aggregation as AggregationInterval,
      );

      const dataMap: SeriesDataMap = {};
      response.series.forEach((s) => {
        dataMap[s.code] = s.data;
      });

      set({ previewData: dataMap, isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch preview data:', err);
      set({ error: err?.message || 'Failed to fetch data', isLoading: false });
    }
  },

  fetchFilterOptions: async () => {
    try {
      const options = await synapseService.getTagFilterOptions();
      set({ filterOptions: options });
    } catch (err) {
      console.warn('Failed to fetch filter options:', err);
    }
  },

  fetchBuildings: async () => {
    try {
      const buildings = await synapseService.getBuildings();
      set({ buildings });
    } catch (err) {
      console.warn('Failed to fetch buildings:', err);
    }
  },

  saveWidget: async () => {
    const { config } = get();
    set({ isLoading: true, error: null });
    try {
      const saved = await synapseService.saveWidget(config);
      set({ config: { ...saved }, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to save widget', isLoading: false });
    }
  },

  setActiveSettingsTab: (tab) => set({ activeSettingsTab: tab }),
}));
