import React from 'react';
import {
  TextField,
  MenuItem,
  Stack,
  Box,
  Typography,
  Slider,
  FormControlLabel,
  Switch,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import Collapse from '@mui/material/Collapse';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import type { BarLayout, PieLayout } from '@/types/widget';

const refreshOptions = [
  { label: 'Disabled', value: 0 },
  { label: '10 seconds', value: 10 },
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '15 minutes', value: 900 },
];

export const GeneralSettings: React.FC = () => {
  const { config, updateGeneral, updateChart } = useWidgetConfigStore();
  const { general, chart } = config;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>Data Freshness</Typography>
        <TextField
          select
          label="Auto Refresh"
          value={general.refreshInterval}
          onChange={(e) => updateGeneral({ refreshInterval: Number(e.target.value) })}
          fullWidth
          size="small"
        >
          {refreshOptions.map((ri) => (
            <MenuItem key={ri.value} value={ri.value}>
              {ri.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>Chart Specific Styling</Typography>
        
        {/* Line Width (for line/area) */}
        <Collapse in={chart.type === 'line' || chart.type === 'area'}>
          <Box sx={{ mb: 2 }}>
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
        </Collapse>

        {/* Fill Opacity (for area) */}
        <Collapse in={chart.type === 'area'}>
          <Box sx={{ mb: 2 }}>
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
        </Collapse>

        {/* Bar Layout */}
        <Collapse in={chart.type === 'bar'}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Bar Layout
            </Typography>
            <ToggleButtonGroup
              value={chart.barLayout || 'grouped'}
              exclusive
              onChange={(_, val) => val && updateChart({ barLayout: val as BarLayout })}
              size="small"
              fullWidth
            >
              <ToggleButton value="grouped">Grouped</ToggleButton>
              <ToggleButton value="stacked">Stacked</ToggleButton>
              <ToggleButton value="horizontal">Horizontal</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Collapse>

        {/* Pie Layout */}
        <Collapse in={chart.type === 'pie'}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Pie Style
            </Typography>
            <ToggleButtonGroup
              value={chart.pieLayout || 'standard'}
              exclusive
              onChange={(_, val) => val && updateChart({ pieLayout: val as PieLayout })}
              size="small"
              fullWidth
            >
              <ToggleButton value="standard">Standard</ToggleButton>
              <ToggleButton value="donut">Donut</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Collapse>

        {/* Scatter Specifics */}
        <Collapse in={chart.type === 'scatter'}>
          <Stack spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Min Point Size: {chart.scatterPointMinSize || 4}px
              </Typography>
              <Slider
                value={chart.scatterPointMinSize || 4}
                onChange={(_, val) => updateChart({ scatterPointMinSize: val as number })}
                min={2}
                max={20}
                valueLabelDisplay="auto"
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Max Point Size: {chart.scatterPointMaxSize || 20}px
              </Typography>
              <Slider
                value={chart.scatterPointMaxSize || 20}
                onChange={(_, val) => updateChart({ scatterPointMaxSize: val as number })}
                min={10}
                max={50}
                valueLabelDisplay="auto"
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={!!chart.showTrendline}
                  onChange={(_, v) => updateChart({ showTrendline: v })}
                  color="primary"
                  size="small"
                />
              }
              label="Show Trendline"
            />
          </Stack>
        </Collapse>

      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>Universal Visuals</Typography>
        <Stack spacing={1}>
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

          {/* Annotations */}
          <FormControlLabel
            control={
              <Switch
                checked={!!chart.showDataLabels}
                onChange={(_, v) => updateChart({ showDataLabels: v })}
                color="primary"
                size="small"
              />
            }
            label="Show Data Labels"
          />
        </Stack>
      </Box>
    </Stack>
  );
};
