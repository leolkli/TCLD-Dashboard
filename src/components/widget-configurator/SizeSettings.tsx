import React from 'react';
import {
  Box,
  Typography,
  Slider,
  FormControlLabel,
  Switch,
  TextField,
  Stack,
} from '@mui/material';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';

export const SizeSettings: React.FC = () => {
  const { config, updateSize } = useWidgetConfigStore();
  const { size } = config;

  return (
    <Box>
      <FormControlLabel
        control={
          <Switch
            checked={size.useContainerSize}
            onChange={(_, checked) => updateSize({ useContainerSize: checked })}
            color="primary"
          />
        }
        label="Auto-fit container"
        sx={{ mb: 1 }}
      />

      {!size.useContainerSize && (
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Width"
            value={size.width}
            onChange={(e) => updateSize({ width: e.target.value })}
            placeholder="e.g. 100%, 600px"
            fullWidth
            size="small"
          />
          <TextField
            label="Height"
            value={size.height}
            onChange={(e) => updateSize({ height: e.target.value })}
            placeholder="e.g. 100%, 400px"
            fullWidth
            size="small"
          />
        </Stack>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Grid Column Span (2-12)
      </Typography>
      <Slider
        value={size.gridColSpan ?? 6}
        onChange={(_, val) => updateSize({ gridColSpan: val as number })}
        min={2}
        max={12}
        step={1}
        marks
        valueLabelDisplay="auto"
        sx={{ mt: 1 }}
      />
    </Box>
  );
};
