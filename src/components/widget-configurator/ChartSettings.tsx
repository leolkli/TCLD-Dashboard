import React, { useMemo } from 'react';
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Stack,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  ShowChart as LineIcon,
  BarChart as BarIcon,
  BubbleChart as ScatterIcon,
  StackedLineChart as AreaIcon,
  PieChart as PieIcon,
  GridOn as HeatmapIcon,
  Numbers as NumbersIcon,
} from '@mui/icons-material';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import type { WidgetChartType, DataRelationship } from '@/types/widget';

const relationships: { label: string; value: DataRelationship }[] = [
  { label: 'Single Metric / KPI', value: 'single-metric' },
  { label: 'Change over time', value: 'change-over-time' },
  { label: 'Comparing categories', value: 'comparing-categories' },
  { label: 'Part of a whole', value: 'part-of-whole' },
  // { label: 'Correlation', value: 'correlation' }, // Hidden for now
];

const allChartTypes: {
  label: string;
  value: WidgetChartType;
  icon: React.ReactNode;
  validFor: DataRelationship[];
}[] = [
  {
    label: 'KPI',
    value: 'kpi',
    icon: <NumbersIcon fontSize="small" />,
    validFor: ['single-metric'],
  },
  {
    label: 'Line',
    value: 'line',
    icon: <LineIcon fontSize="small" />,
    validFor: ['change-over-time'],
  },
  {
    label: 'Area',
    value: 'area',
    icon: <AreaIcon fontSize="small" />,
    validFor: ['change-over-time'],
  },
  {
    label: 'Bar',
    value: 'bar',
    icon: <BarIcon fontSize="small" />,
    validFor: ['change-over-time', 'comparing-categories', 'part-of-whole'],
  },
  {
    label: 'Scatter',
    value: 'scatter',
    icon: <ScatterIcon fontSize="small" />,
    validFor: ['comparing-categories', 'correlation'],
  },
  { label: 'Pie', value: 'pie', icon: <PieIcon fontSize="small" />, validFor: ['part-of-whole'] },
  {
    label: 'Heatmap',
    value: 'heatmap',
    icon: <HeatmapIcon fontSize="small" />,
    validFor: ['change-over-time', 'correlation'],
  },
];

export const ChartSettings: React.FC = () => {
  const { config, updateChart } = useWidgetConfigStore();
  const { chart } = config;

  const handleRelationshipChange = (newRel: DataRelationship) => {
    // Find first valid chart for this relationship
    const firstValid = allChartTypes.find((ct) => ct.validFor.includes(newRel));
    updateChart({
      relationship: newRel,
      type: firstValid ? firstValid.value : 'bar',
    });
  };

  const validCharts = useMemo(
    () =>
      allChartTypes.filter((ct) => ct.validFor.includes(chart.relationship || 'change-over-time')),
    [chart.relationship]
  );

  return (
    <Stack spacing={2}>
      {/* Data Relationship */}
      <FormControl size="small" fullWidth>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          What is the data relationship?
        </Typography>
        <Select
          value={chart.relationship || 'change-over-time'}
          onChange={(e) => handleRelationshipChange(e.target.value as DataRelationship)}
          displayEmpty
          sx={{ borderRadius: 2 }}
        >
          {relationships.map((rel) => (
            <MenuItem key={rel.value} value={rel.value}>
              {rel.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
          {validCharts.map((ct) => (
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

      </Stack>
  );
};
