export type DataType = 'accumulated' | 'actual';
export type CollectionFrequency = 'hourly' | 'daily' | 'monthly' | 'yearly';
export type CalculationStep = 'raw' | 'hourly' | 'daily' | 'monthly' | 'yearly';
export type CalculationType = 'none' | 'mean' | 'sum' | 'count' | 'min' | 'max';

export interface VtagConfiguration {
  id?: string;
  name: string;
  systemCode: string; // The unique identifer (e.g. VTAG_001)
  description?: string;
  
  // Date validation rules
  effectiveFrom: string; // ISO date string
  effectiveTo: string;   // ISO date string
  
  dataType: DataType;

  calculationStep: CalculationStep;
  calculationType: CalculationType;
  
  calculationLevel: number; // 1 = depends on PTags, 2 = depends on Level 1 VTags, etc.
  
  formulaTokens: FormulaToken[]; 
}

export type TokenType = 'ptag' | 'vtag' | 'operator' | 'conditional' | 'number';

export interface FormulaToken {
  id: string; // unique ID for React drag-and-drop list mapping
  type: TokenType;
  value: string; // e.g., 'PTAG_123', '+', 'IF', '50.5'
  label?: string; // Display string, e.g., 'Total Power'
  level?: number; // Needed to compute overall sequence calculation level
}

export const DEFAULT_VTAG_CONFIG: VtagConfiguration = {
  name: '',
  systemCode: '',
  description: '',
  effectiveFrom: new Date().toISOString(),
  effectiveTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
  dataType: 'actual',
  calculationStep: 'raw',
  calculationType: 'none',
  calculationLevel: 1,
  formulaTokens: []
};
