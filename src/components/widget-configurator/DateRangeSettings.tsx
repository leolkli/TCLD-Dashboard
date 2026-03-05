import React from 'react';
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  TextField,
  Stack,
} from '@mui/material';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import type { DateRangePreset, AggregationInterval } from '@/types/widget';

const presets: { label: string; value: DateRangePreset }[] = [
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' },
  { label: 'All', value: 'ALL' },
  { label: 'Custom', value: 'custom' },
];

const aggregations: { label: string; value: AggregationInterval }[] = [
  { label: 'Raw', value: 'raw' },
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

export const DateRangeSettings: React.FC = () => {
  const { config, updateDateRange } = useWidgetConfigStore();
  const { dateRange } = config;

  return (
    <Box>
      {/* Preset buttons */}
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        Time Range
      </Typography>
      <ToggleButtonGroup
        value={dateRange.preset}
        exclusive
        onChange={(_, val) => val && updateDateRange({ preset: val })}
        size="small"
        sx={{ flexWrap: 'wrap', gap: 0.5, mb: 2 }}
      >
        {presets.map((p) => (
          <ToggleButton
            key={p.value}
            value={p.value}
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: '8px !important',
              border: '1px solid',
              borderColor: 'grey.300',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
              },
            }}
          >
            {p.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Custom date inputs */}
      {dateRange.preset === 'custom' && (
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            label="Start Date"
            type="date"
            value={dateRange.customStart?.split('T')[0] || ''}
            onChange={(e) => updateDateRange({ customStart: new Date(e.target.value).toISOString() })}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            value={dateRange.customEnd?.split('T')[0] || ''}
            onChange={(e) => updateDateRange({ customEnd: new Date(e.target.value).toISOString() })}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      )}

      {/* Aggregation */}
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        Aggregation
      </Typography>
      <ToggleButtonGroup
        value={dateRange.aggregation}
        exclusive
        onChange={(_, val) => val && updateDateRange({ aggregation: val })}
        size="small"
        sx={{ flexWrap: 'wrap', gap: 0.5 }}
      >
        {aggregations.map((a) => (
          <ToggleButton
            key={a.value}
            value={a.value}
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: '8px !important',
              border: '1px solid',
              borderColor: 'grey.300',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
              },
            }}
          >
            {a.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};
