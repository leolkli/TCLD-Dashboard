import { create } from 'zustand';
import { VtagConfiguration, FormulaToken, DEFAULT_VTAG_CONFIG } from '@/types/vtagConfig';

interface VtagState {
  config: VtagConfiguration;
  isLoading: boolean;
  error: string | null;
  saveSuccessMsg: string | null;
  historyOverlaps: boolean;

  // Actions
  setConfig: (partial: Partial<VtagConfiguration>) => void;
  resetConfig: () => void;
  
  // Formula actions
  addToken: (token: FormulaToken, index?: number) => void;
  addTokens: (tokens: FormulaToken[], startIndex?: number) => void;
  removeToken: (tokenId: string) => void;
  updateToken: (tokenId: string, updates: Partial<FormulaToken>) => void;
  updateTokenOrder: (sourceIndex: number, targetIndex: number) => void;
  
  // Computations
  recalculateLevel: () => void;
  checkDateOverlaps: (historicalDates: {start: string, end: string}[]) => void;
  
  saveVtag: () => Promise<void>;
}

export const useVtagStore = create<VtagState>((set, get) => ({
  config: { ...DEFAULT_VTAG_CONFIG },
  isLoading: false,
  error: null,
  saveSuccessMsg: null,
  historyOverlaps: false,

  setConfig: (partial) => 
    set((state) => ({ config: { ...state.config, ...partial } })),

  resetConfig: () => set({ config: { ...DEFAULT_VTAG_CONFIG }, error: null, historyOverlaps: false }),

  addToken: (token, index) => set((state) => {
    const tokens = [...state.config.formulaTokens];
    if (typeof index === 'number') {
      tokens.splice(index, 0, token);
    } else {
      tokens.push(token);
    }

    // Auto-update level after adding token
    const maxTokenLevel = tokens.reduce((max, t) => Math.max(max, t.level || 0), 0);

    return {
      config: {
        ...state.config,
        formulaTokens: tokens,
        calculationLevel: maxTokenLevel + 1 // Ptag is 0, Vtag varies
      } 
    };
  }),

  addTokens: (newTokens, startIndex) => set((state) => {
    const tokens = [...state.config.formulaTokens];
    if (typeof startIndex === 'number') {
      tokens.splice(startIndex, 0, ...newTokens);
    } else {
      tokens.push(...newTokens);
    }

    const maxTokenLevel = tokens.reduce((max, t) => Math.max(max, t.level || 0), 0);

    return {
      config: {
        ...state.config,
        formulaTokens: tokens,
        calculationLevel: maxTokenLevel + 1
      }
    };
  }),

  removeToken: (tokenId) => set((state) => {
    const tokens = state.config.formulaTokens.filter(t => t.id !== tokenId);

    // Auto-update level after removing
    const maxTokenLevel = tokens.reduce((max, t) => Math.max(max, t.level || 0), 0);

    return {
      config: {
        ...state.config,
        formulaTokens: tokens,
        calculationLevel: maxTokenLevel + 1
      }
    };
  }),

  updateToken: (tokenId, updates) => set((state) => {
    const tokens = state.config.formulaTokens.map(t => 
      t.id === tokenId ? { ...t, ...updates } : t
    );
    const maxTokenLevel = tokens.reduce((max, t) => Math.max(max, t.level || 0), 0);
    return {
      config: {
        ...state.config,
        formulaTokens: tokens,
        calculationLevel: maxTokenLevel + 1
      }
    };
  }),

  updateTokenOrder: (sourceIndex, targetIndex) => set((state) => {
    const tokens = [...state.config.formulaTokens];
    const [moved] = tokens.splice(sourceIndex, 1);
    if (!moved) return state;
    
    tokens.splice(targetIndex, 0, moved);
    return { config: { ...state.config, formulaTokens: tokens } };
  }),

  recalculateLevel: () => set((state) => {
    const maxTokenLevel = state.config.formulaTokens.reduce((max, t) => Math.max(max, t.level || 0), 0);
    return {
      config: {
        ...state.config,
        calculationLevel: maxTokenLevel + 1
      }
    };
  }),

  checkDateOverlaps: (historicalDates) => {
    const { config } = get();
    const currentStart = new Date(config.effectiveFrom).getTime();
    const currentEnd = new Date(config.effectiveTo).getTime();

    const hasOverlap = historicalDates.some(history => {
      const histStart = new Date(history.start).getTime();
      const histEnd = new Date(history.end).getTime();
      return (currentStart <= histEnd) && (currentEnd >= histStart);
    });

    set({ historyOverlaps: hasOverlap });
  },

  saveVtag: async () => {
    const { config, historyOverlaps } = get();
    if (historyOverlaps) {
      set({ error: "Cannot save: Overlapping effective periods detected." });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      // Connect to Express backend
      const response = await fetch('/api/vtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save to database');
      }

      // Update state with auto-generated code map if returned
      set({ 
        isLoading: false,
        config: { ...config, systemCode: result.data.systemCode },
        saveSuccessMsg: `Successfully saved: ${result.data.systemCode}`
      });
      
      // Auto-jump the message after 4s
      setTimeout(() => {
         set({ saveSuccessMsg: null });
      }, 4000);
    } catch (err: any) {
      set({ error: err.message || 'Failed to save Vtag', isLoading: false });
    }
  }
}));
