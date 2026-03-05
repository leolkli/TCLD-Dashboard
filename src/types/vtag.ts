/**
 * Virtual Tag (Vtag) Types and Interfaces
 */

export interface Vtag {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  unit: string;
  category: VtagCategory;
  buildingId: string | null; // null = global vtag
  currentVersionId: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type VtagCategory =
  | 'energy_consumption'
  | 'energy_cost'
  | 'efficiency'
  | 'environmental'
  | 'performance'
  | 'custom';

export interface VtagVersion {
  id: string;
  vtagId: string;
  versionNumber: number;
  formula: VtagFormula;
  conditions: VtagCondition[];
  effectivePeriod: EffectivePeriod | null;
  status: VtagVersionStatus;
  createdBy: string;
  approvedBy: string | null;
  createdAt: string;
  approvedAt: string | null;
}

export type VtagVersionStatus = 'draft' | 'active' | 'archived' | 'superseded';

export interface VtagFormula {
  expression: string; // e.g., "(ptag1 + ptag2) * 0.5"
  variables: VtagVariable[];
  outputType: 'number' | 'percentage' | 'ratio';
  precision: number;
}

export interface VtagVariable {
  name: string;
  type: 'ptag' | 'vtag' | 'constant';
  sourceId?: string; // ptag or vtag ID
  value?: number; // for constants
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'last';
}

export interface VtagCondition {
  id: string;
  name: string;
  description: string | null;
  expression: string; // e.g., "ptag1 > 100 AND ptag2 < 50"
  alternativeFormula?: string; // formula to use when condition is true
  priority: number; // lower = higher priority
}

export interface EffectivePeriod {
  startDate: string;
  endDate: string | null;
  schedule?: ScheduleConfig;
}

export interface ScheduleConfig {
  type: 'always' | 'business_hours' | 'custom';
  timezone: string;
  customSchedule?: WeeklySchedule;
}

export interface WeeklySchedule {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;
}

/**
 * Vtag Version History (for 30-day rollback)
 */
export interface VtagVersionHistory {
  id: string;
  vtagId: string;
  versionId: string;
  action: VtagHistoryAction;
  previousState: Partial<VtagVersion> | null;
  newState: Partial<VtagVersion>;
  changedBy: string;
  changeReason: string | null;
  createdAt: string;
}

export type VtagHistoryAction =
  | 'created'
  | 'activated'
  | 'updated'
  | 'archived'
  | 'rolled_back';

/**
 * Vtag Calculation Results (cached)
 */
export interface VtagResult {
  id: string;
  vtagId: string;
  versionId: string;
  buildingId: string;
  timestamp: string;
  value: number;
  conditionApplied: string | null;
  inputValues: Record<string, number>;
  calculatedAt: string;
}
