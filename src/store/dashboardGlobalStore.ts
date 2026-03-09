import { create } from 'zustand';
import type { DateRangePreset } from '@/types/widget';

export interface GlobalFilters {
  dateRange: {
    preset: DateRangePreset;
    customStart?: string;
    customEnd?: string;
  };
}

interface DashboardGlobalState {
  isEditMode: boolean;
  globalFilters: GlobalFilters;
  
  // Modals state
  isWidgetLibraryOpen: boolean;
  editingWidgetId: string | null;

  setEditMode: (editMode: boolean) => void;  
  setGlobalDateRangePreset: (preset: DateRangePreset) => void;
  setGlobalDateRangeCustom: (start: string, end: string) => void;
  
  setWidgetLibraryOpen: (isOpen: boolean) => void;
  setEditingWidgetId: (widgetId: string | null) => void;
}

export const useDashboardGlobalStore = create<DashboardGlobalState>((set) => ({
  isEditMode: false,
  globalFilters: {
    dateRange: {
      preset: '1M', // Default to 1 Month    
    },
  },
  
  isWidgetLibraryOpen: false,
  editingWidgetId: null,

  setEditMode: (isEditMode) => set({ isEditMode }),

  setGlobalDateRangePreset: (preset) => set((state) => ({
    globalFilters: {
      ...state.globalFilters,
      dateRange: { preset, customStart: undefined, customEnd: undefined }
    }
  })),

  setGlobalDateRangeCustom: (start, end) => set((state) => ({
    globalFilters: {
      ...state.globalFilters,
      dateRange: { preset: 'custom', customStart: start, customEnd: end }
    }
  })),
  
  setWidgetLibraryOpen: (isWidgetLibraryOpen) => set({ isWidgetLibraryOpen }),
  setEditingWidgetId: (editingWidgetId) => set({ editingWidgetId }),
}));
