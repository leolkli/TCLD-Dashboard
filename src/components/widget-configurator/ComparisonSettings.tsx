import React from 'react';
import {
  Stack,
  FormControlLabel,
  Switch,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Box,
} from '@mui/material';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import type { ComparisonMode } from '@/types/widget';

const modes: { label: string; value: ComparisonMode; description: string }[] = [
  { label: 'Same Axis', value: 'same-axis', description: 'All series share the Y-axis' },
  { label: 'Dual Axis', value: 'dual-axis', description: 'Left and right Y-axes' },
];

export const ComparisonSettings: React.FC = () => {
  const { config, updateComparison } = useWidgetConfigStore();
  const { comparison } = config;

  const multipleDataPoints = config.dataPoints.length > 1;

  return (
    <Stack spacing={1.5}>
      <FormControlLabel
        control={
          <Switch
            checked={comparison.enabled}
            onChange={(_, v) => updateComparison({ enabled: v })}
            color="primary"
            disabled={!multipleDataPoints}
          />
        }
        label="Enable Comparison Mode"
      />

      {!multipleDataPoints && (
        <Typography variant="caption" color="text.disabled">
          Add at least 2 data points to enable comparison
        </Typography>
      )}

      {comparison.enabled && multipleDataPoints && (
        <>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Axis Mode
            </Typography>
            <ToggleButtonGroup
              value={comparison.mode}
              exclusive
              onChange={(_, val) => val && updateComparison({ mode: val })}
              size="small"
            >
              {modes.map((m) => (
                <ToggleButton key={m.value} value={m.value} sx={{ px: 2 }}>
                  {m.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={comparison.showVolume}
                onChange={(_, v) => updateComparison({ showVolume: v })}
                color="primary"
                size="small"
              />
            }
            label="Show Volume Bars"
          />
        </>
      )}
    </Stack>
  );
};
