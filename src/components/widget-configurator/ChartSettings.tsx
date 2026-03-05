import React from 'react';
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Slider,
  FormControlLabel,
  Switch,
  Stack,
} from '@mui/material';
import {
  ShowChart as LineIcon,
  BarChart as BarIcon,
  BubbleChart as ScatterIcon,
  CandlestickChart as CandleIcon,
  StackedLineChart as AreaIcon,
} from '@mui/icons-material';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import type { WidgetChartType } from '@/types/widget';

const chartTypes: { label: string; value: WidgetChartType; icon: React.ReactNode }[] = [
  { label: 'Line', value: 'line', icon: <LineIcon fontSize="small" /> },
  { label: 'Area', value: 'area', icon: <AreaIcon fontSize="small" /> },
  { label: 'Bar', value: 'bar', icon: <BarIcon fontSize="small" /> },
  { label: 'Candle', value: 'candlestick', icon: <CandleIcon fontSize="small" /> },
  { label: 'Scatter', value: 'scatter', icon: <ScatterIcon fontSize="small" /> },
];

export const ChartSettings: React.FC = () => {
  const { config, updateChart } = useWidgetConfigStore();
  const { chart } = config;

  return (
    <Stack spacing={2}>
      {/* Chart Type */}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          Chart Type
        </Typography>
        <ToggleButtonGroup
          value={chart.type}
          exclusive
          onChange={(_, val) => val && updateChart({ type: val })}
          size="small"
          sx={{ flexWrap: 'wrap', gap: 0.5 }}
        >
          {chartTypes.map((ct) => (
            <ToggleButton
              key={ct.value}
              value={ct.value}
              sx={{
                display: 'flex',
                gap: 0.5,
                px: 1.5,
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
              {ct.icon}
              {ct.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Line Width (for line/area) */}
      {(chart.type === 'line' || chart.type === 'area') && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            Line Width: {chart.lineWidth}px
          </Typography>
          <Slider
            value={chart.lineWidth}
            onChange={(_, val) => updateChart({ lineWidth: val as number })}
            min={1}
            max={5}
            step={0.5}
            valueLabelDisplay="auto"
          />
        </Box>
      )}

      {/* Fill Opacity (for area) */}
      {chart.type === 'area' && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            Fill Opacity: {chart.fillOpacity}%
          </Typography>
          <Slider
            value={chart.fillOpacity}
            onChange={(_, val) => updateChart({ fillOpacity: val as number })}
            min={0}
            max={100}
            valueLabelDisplay="auto"
          />
        </Box>
      )}

      {/* Candlestick colors */}
      {chart.type === 'candlestick' && (
        <Stack direction="row" spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">Up</Typography>
            <Box
              component="input"
              type="color"
              value={chart.upColor}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateChart({ upColor: e.target.value })}
              sx={{ width: 28, height: 28, border: 'none', cursor: 'pointer', borderRadius: 1, p: 0 }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">Down</Typography>
            <Box
              component="input"
              type="color"
              value={chart.downColor}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateChart({ downColor: e.target.value })}
              sx={{ width: 28, height: 28, border: 'none', cursor: 'pointer', borderRadius: 1, p: 0 }}
            />
          </Box>
        </Stack>
      )}

      {/* Grid Lines */}
      <FormControlLabel
        control={
          <Switch
            checked={chart.showGridLines}
            onChange={(_, v) => updateChart({ showGridLines: v })}
            color="primary"
            size="small"
          />
        }
        label="Show Grid Lines"
      />

      {/* Background Color */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Background
        </Typography>
        <Box
          component="input"
          type="color"
          value={chart.backgroundColor}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateChart({ backgroundColor: e.target.value })}
          sx={{ width: 28, height: 28, border: 'none', cursor: 'pointer', borderRadius: 1, p: 0 }}
        />
      </Box>
    </Stack>
  );
};
