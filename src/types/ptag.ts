/**
 * Physical Tag (Ptag) Types - Read from Azure Synapse
 */

export interface Ptag {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  unit: string;
  buildingId: string;
  floorId: string | null;
  zoneId: string | null;
  equipmentId: string | null;
  dataType: PtagDataType;
  category: PtagCategory;
  source: string; // data source identifier
  isActive: boolean;
  lastUpdated: string;
}

export type PtagDataType = 'numeric' | 'boolean' | 'string';

export type PtagCategory =
  | 'electricity'
  | 'gas'
  | 'water'
  | 'temperature'
  | 'humidity'
  | 'pressure'
  | 'flow'
  | 'occupancy'
  | 'other';

export interface PtagReading {
  ptagId: string;
  timestamp: string;
  value: number;
  quality: DataQuality;
}

export type DataQuality = 'good' | 'uncertain' | 'bad';

export interface PtagTimeSeries {
  ptagId: string;
  ptagName: string;
  unit: string;
  data: TimeSeriesDataPoint[];
  aggregation: string;
  startTime: string;
  endTime: string;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  quality?: DataQuality;
}
