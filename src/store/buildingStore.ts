import { create } from 'zustand';
import type { Building } from '@/types';

interface BuildingState {
  buildings: Building[];
  selectedBuilding: Building | null;
  isLoading: boolean;
  error: string | null;
  setBuildings: (buildings: Building[]) => void;
  selectBuilding: (building: Building | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBuildingStore = create<BuildingState>((set) => ({
  buildings: [],
  selectedBuilding: null,
  isLoading: false,
  error: null,

  setBuildings: (buildings) => set({ buildings, error: null }),

  selectBuilding: (selectedBuilding) => set({ selectedBuilding }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));
