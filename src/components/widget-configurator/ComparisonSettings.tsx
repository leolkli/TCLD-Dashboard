import React from 'react';
import {
  Stack,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Select,
  MenuItem,
  TextField,
  Collapse,
} from '@mui/material';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import type { DateRangePreset } from '@/types/widget';

const PRESETS: { label: string; value: DateRangePreset }[] = [
  { label: '1 Day', value: '1D' },
  { label: '1 Week', value: '1W' },
  { label: '1 Month', value: '1M' },
  { label: '3 Months', value: '3M' },
  { label: '6 Months', value: '6M' },
  { label: '1 Year', value: '1Y' },
  { label: 'All Time', value: 'ALL' },
  { label: 'Custom', value: 'custom' },
];

// Helper to determine logical baseline presets based on target
const getBaselinePresetsForTarget = (targetPreset: DateRangePreset | null): { label: string; value: DateRangePreset }[] => {
  if (targetPreset === 'custom') {
    return [
      { label: 'Same Duration, Previous Period', value: 'custom' },
      { label: 'Same Dates, Previous Year', value: '1Y' }
    ];
  }
  
  if (!targetPreset || targetPreset === 'ALL') return PRESETS;
  
  // Smart options: if target is 1M, baseline suggests Previous Month, or Last Year Same Month
  const options: { label: string; value: DateRangePreset }[] = [];
  
  options.push({ label: `Previous ${targetPreset.replace('1', '').replace('D', 'Day').replace('W', 'Week').replace('M', 'Month').replace('Y', 'Year')}`, value: targetPreset });
  
  if (targetPreset !== '1Y') {
    options.push({ label: 'Last Year Same Period', value: '1Y' }); // In real app, this would be a custom value specifically resolving to 1 year ago same dates
  }

  return [...options, ...PRESETS.filter(p => p.value !== targetPreset && p.value !== '1Y')];
};

export const ComparisonSettings: React.FC = () => {
  const { config, updateComparison, updateComparisonBaseline, updateComparisonTarget } = useWidgetConfigStore();
  const { comparison } = config;

  const handleTargetPresetChange = (preset: DateRangePreset) => {
    updateComparisonTarget({ preset });
    // Reset baseline when target changes to prompt new selection
    if (preset !== 'custom' && comparison.baseline.preset === 'custom') {
        updateComparisonBaseline({ preset: preset });
    }
  };

  const handleBaselinePresetChange = (preset: DateRangePreset) => {
    updateComparisonBaseline({ preset });
  };

  return (
    <Stack spacing={1.5}>
      <FormControlLabel
        control={
          <Switch
            checked={comparison.enabled}
            onChange={(_, v) => {
              updateComparison({ enabled: v });
              if (v) {
                 updateComparisonTarget({ enabled: true });
                 updateComparisonBaseline({ enabled: true });
              }
            }}
            color="primary"
          />
        }
        label="Enable Period Comparison"
      />

      <Collapse in={comparison.enabled}>
        <Stack spacing={2} sx={{ mt: 1, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          {/* Target Period */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Target Period (Primary)
            </Typography>
            <Select
              size="small"
              fullWidth
              value={comparison.target.preset || '1M'}
              onChange={(e) => handleTargetPresetChange(e.target.value as DateRangePreset)}
            >
              {PRESETS.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </Select>

            {comparison.target.preset === 'custom' && (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <TextField
                  type="date"
                  size="small"
                  label="Start Date"
                  value={comparison.target.customStart?.split('T')[0] || ''}
                  onChange={(e) => updateComparisonTarget({ customStart: new Date(e.target.value).toISOString() })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  type="date"
                  size="small"
                  label="End Date"
                  value={comparison.target.customEnd?.split('T')[0] || ''}
                  onChange={(e) => updateComparisonTarget({ customEnd: new Date(e.target.value).toISOString() })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
            )}
          </Box>

          {/* Baseline Period */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Baseline Period (Comparison)
            </Typography>
            <Select
              size="small"
              fullWidth
              value={comparison.baseline.preset || '1M'}
              onChange={(e) => handleBaselinePresetChange(e.target.value as DateRangePreset)}
            >
              {getBaselinePresetsForTarget(comparison.target.preset).map((p, i) => (
                <MenuItem key={`${p.value}-${i}`} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </Select>

            {comparison.baseline.preset === 'custom' && (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <TextField
                  type="date"
                  size="small"
                  label="Start Date"
                  value={comparison.baseline.customStart?.split('T')[0] || ''}
                  onChange={(e) => updateComparisonBaseline({ customStart: new Date(e.target.value).toISOString() })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  type="date"
                  size="small"
                  label="End Date"
                  value={comparison.baseline.customEnd?.split('T')[0] || ''}
                  onChange={(e) => updateComparisonBaseline({ customEnd: new Date(e.target.value).toISOString() })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
            )}
          </Box>
        </Stack>
      </Collapse>
    </Stack>
  );
};
