/**
 * Building Types and Interfaces
 */

export interface Building {
  id: string;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  country: string | null;
  timezone: string;
  floorCount: number;
  totalArea: number | null; // in square meters
  energyType: EnergyType[];
  imageUrl: string | null;
  isActive: boolean;
  metadata: BuildingMetadata;
  createdAt: string;
  updatedAt: string;
}

export type EnergyType = 'electricity' | 'gas' | 'water' | 'steam' | 'chilled_water';

export interface BuildingMetadata {
  constructionYear?: number;
  occupancy?: number;
  operatingHours?: {
    start: string;
    end: string;
  };
  [key: string]: unknown;
}

export interface BuildingWithStats extends Building {
  currentEnergyUsage: number;
  energyTrend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  alertCount: number;
}

export interface Floor {
  id: string;
  buildingId: string;
  name: string;
  floorNumber: number;
  area: number | null;
  zones: Zone[];
}

export interface Zone {
  id: string;
  floorId: string;
  name: string;
  type: ZoneType;
  area: number | null;
}

export type ZoneType = 
  | 'office'
  | 'meeting_room'
  | 'common_area'
  | 'server_room'
  | 'data_center'
  | 'cafeteria'
  | 'lobby'
  | 'parking'
  | 'storage'
  | 'mechanical'
  | 'other';
