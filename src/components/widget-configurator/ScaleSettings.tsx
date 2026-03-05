import React from 'react';
import {
  Stack,
  FormControlLabel,
  Switch,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  TextField,
  Box,
  Slider,
} from '@mui/material';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import type { ScaleType } from '@/types/widget';

export const ScaleSettings: React.FC = () => {
  const { config, updateScales } = useWidgetConfigStore();
  const { scales } = config;

  return (
    <Stack spacing={2}>
      {/* Scale Type */}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          Scale Type
        </Typography>
        <ToggleButtonGroup
          value={scales.scaleType}
          exclusive
          onChange={(_, val) => val && updateScales({ scaleType: val as ScaleType })}
          size="small"
        >
          <ToggleButton value="linear" sx={{ px: 2 }}>Linear</ToggleButton>
          <ToggleButton value="log" sx={{ px: 2 }}>Logarithmic</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Y-Axis Mode */}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          Y-Axis Range
        </Typography>
        <ToggleButtonGroup
          value={scales.yAxisMode}
          exclusive
          onChange={(_, val) => val && updateScales({ yAxisMode: val })}
          size="small"
        >
          <ToggleButton value="auto" sx={{ px: 2 }}>Auto</ToggleButton>
          <ToggleButton value="manual" sx={{ px: 2 }}>Manual</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {scales.yAxisMode === 'manual' && (
        <Stack direction="row" spacing={1.5}>
          <TextField
            label="Y Min"
            type="number"
            value={scales.yMin ?? ''}
            onChange={(e) => updateScales({ yMin: e.target.value ? Number(e.target.value) : undefined })}
            size="small"
            fullWidth
          />
          <TextField
            label="Y Max"
            type="number"
            value={scales.yMax ?? ''}
            onChange={(e) => updateScales({ yMax: e.target.value ? Number(e.target.value) : undefined })}
            size="small"
            fullWidth
          />
        </Stack>
      )}

      {/* Precision */}
      <Box>
        <Typography variant="caption" color="text.secondary">
          Decimal Precision: {scales.precision}
        </Typography>
        <Slider
          value={scales.precision}
          onChange={(_, val) => updateScales({ precision: val as number })}
          min={0}
          max={6}
          step={1}
          marks
          valueLabelDisplay="auto"
        />
      </Box>

      {/* Show Price Scale */}
      <FormControlLabel
        control={
          <Switch
            checked={scales.showPriceScale}
            onChange={(_, v) => updateScales({ showPriceScale: v })}
            color="primary"
            size="small"
          />
        }
        label="Show Y-Axis Labels"
      />
    </Stack>
  );
};
