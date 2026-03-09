import { create } from 'zustand';
import type { Dashboard, DashboardWidgetInstance } from '@/types/dashboard';
import type { WidgetConfiguration } from '@/types/widget';
import type { Layout } from 'react-grid-layout';
import { synapseService } from '@/services/synapseService';

interface DashboardState {
  // ── All dashboards loaded from API ───────────────────────────
  dashboards: Dashboard[];
  /** Currently viewed dashboard */
  currentDashboard: Dashboard | null;
  /** All saved widgets for the widget library */
  savedWidgets: WidgetConfiguration[];
  isLoading: boolean;
  error: string | null;

  // ── Actions ──────────────────────────────────────────────────
  fetchAllDashboards: () => Promise<void>;
  fetchDashboard: (id: string) => Promise<void>;
  fetchDashboardsForBuilding: (buildingCode: string) => Promise<Dashboard[]>;
  fetchDashboardsForPortfolio: (portfolioName: string) => Promise<Dashboard[]>;
  saveDashboard: (dashboard: Dashboard) => Promise<Dashboard>;
  deleteDashboard: (id: string) => Promise<void>;
  setCurrentDashboard: (dashboard: Dashboard | null) => void;

  /** Update layout positions */
  updateLayout: (layout: Layout[]) => void;
  /** Add a widget instance to current dashboard */
  addWidgetToDashboard: (widgetId: string, widgetName: string) => void;
  /** Remove a widget instance from current dashboard */
  removeWidgetFromDashboard: (layoutId: string) => void;

  /** Widget library */
  fetchSavedWidgets: (buildingCode?: string) => Promise<void>;
  saveWidget: (widget: WidgetConfiguration) => Promise<WidgetConfiguration>;
  deleteWidget: (id: string) => Promise<void>;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDashboardStore = create<DashboardState>((set, _get) => ({
  dashboards: [],
  currentDashboard: null,
  savedWidgets: [],
  isLoading: false,
  error: null,

  fetchAllDashboards: async () => {
    set({ isLoading: true, error: null });
    try {
      const dashboards = await synapseService.getDashboards();
      set({ dashboards, isLoading: false });
    } catch (err: any) {
      console.warn('Failed to fetch dashboards:', err);
      set({ dashboards: [], isLoading: false, error: err?.message });
    }
  },

  fetchDashboard: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const dashboard = await synapseService.getDashboard(id);
      set({ currentDashboard: dashboard, isLoading: false });
    } catch (err: any) {
      console.warn('Failed to fetch dashboard:', err);
      set({ isLoading: false, error: err?.message });
    }
  },

  fetchDashboardsForBuilding: async (buildingCode) => {
    try {
      const dashboards = await synapseService.getDashboards({ building: buildingCode });
      return dashboards;
    } catch {
      return [];
    }
  },

  fetchDashboardsForPortfolio: async (portfolioName) => {
    try {
      const dashboards = await synapseService.getDashboards({ portfolio: portfolioName });
      return dashboards;
    } catch {
      return [];
    }
  },

  saveDashboard: async (dashboard) => {
    set({ isLoading: true, error: null });
    try {
      const saved = await synapseService.saveDashboard(dashboard);
      // Update local list
      set((state) => {
        const idx = state.dashboards.findIndex((d) => d.id === saved.id);
        const list = [...state.dashboards];
        if (idx >= 0) {
          list[idx] = saved;
        } else {
          list.push(saved);
        }
        return { dashboards: list, currentDashboard: saved, isLoading: false };
      });
      return saved;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message });
      throw err;
    }
  },

  deleteDashboard: async (id) => {
    try {
      await synapseService.deleteDashboard(id);
      set((state) => ({
        dashboards: state.dashboards.filter((d) => d.id !== id),
        currentDashboard: state.currentDashboard?.id === id ? null : state.currentDashboard,
      }));
    } catch (err: any) {
      set({ error: err?.message });
    }
  },

  setCurrentDashboard: (dashboard) => set({ currentDashboard: dashboard }),

  updateLayout: (layout) =>
    set((state) => {
      if (!state.currentDashboard) return state;
      return {
        currentDashboard: { ...state.currentDashboard, layout },
      };
    }),

  addWidgetToDashboard: (widgetId, widgetName) =>
    set((state) => {
      if (!state.currentDashboard) return state;
      const layoutId = `lw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newWidget: DashboardWidgetInstance = { layoutId, widgetId, widgetName };
      // Default layout position: 6 cols wide, 4 rows tall, next available row
      const maxY = state.currentDashboard.layout.reduce(
        (acc, l) => Math.max(acc, l.y + l.h),
        0,
      );
      const newLayout: Layout = { i: layoutId, x: 0, y: maxY, w: 6, h: 4 };
      return {
        currentDashboard: {
          ...state.currentDashboard,
          widgets: [...state.currentDashboard.widgets, newWidget],
          layout: [...state.currentDashboard.layout, newLayout],
        },
      };
    }),

  removeWidgetFromDashboard: (layoutId) =>
    set((state) => {
      if (!state.currentDashboard) return state;
      return {
        currentDashboard: {
          ...state.currentDashboard,
          widgets: state.currentDashboard.widgets.filter((w) => w.layoutId !== layoutId),
          layout: state.currentDashboard.layout.filter((l) => l.i !== layoutId),
        },
      };
    }),

  fetchSavedWidgets: async (buildingCode) => {
    try {
      const widgets = await synapseService.getWidgets(buildingCode);
      set({ savedWidgets: widgets });
    } catch (err) {
      console.warn('Failed to fetch saved widgets:', err);
      set({ savedWidgets: [] });
    }
  },

  saveWidget: async (widget) => {
    set({ isLoading: true, error: null });
    try {
      const saved = await synapseService.saveWidget(widget);
      set((state) => {
        const idx = state.savedWidgets.findIndex((w) => w.id === saved.id);
        const list = [...state.savedWidgets];
        if (idx >= 0) {
          list[idx] = saved;
        } else {
          list.push(saved);
        }
        return { savedWidgets: list, isLoading: false };
      });
      return saved;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message });
      throw err;
    }
  },

  deleteWidget: async (id) => {
    try {
      await synapseService.deleteWidget(id);
      set((state) => ({
        savedWidgets: state.savedWidgets.filter((w) => w.id !== id),
      }));
    } catch (err: any) {
      set({ error: err?.message });
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

