import React from 'react';
import {
  Box,
  FormControlLabel,
  Switch,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Stack,
  TextField
} from '@mui/material';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import type { HeaderFontSize } from '@/types/widget';

const fontSizes: { label: string; value: HeaderFontSize }[] = [
  { label: 'S', value: 'small' },
  { label: 'M', value: 'medium' },
  { label: 'L', value: 'large' },
];

export const HeaderSettings: React.FC = () => {
  const { config, updateHeader, updateGeneral } = useWidgetConfigStore();
  const { header, general } = config;

  return (
    <Stack spacing={2}>
      <TextField
        label="Description / Subtitle"
        value={general.description || ''}
        onChange={(e) => updateGeneral({ description: e.target.value })}
        fullWidth
        size="small"
        multiline
        rows={2}
      />

      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={header.visible}
              onChange={(_, v) => updateHeader({ visible: v })}
              color="primary"
            />
          }
          label={<strong>Show Header Area</strong>}
        />
      </Box>

      {header.visible && (
        <Stack spacing={1.5} pl={1} borderLeft="2px solid" borderColor="primary.light">
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Title Typography Size
            </Typography>
            <ToggleButtonGroup
              value={header.fontSize}
              exclusive
              onChange={(_, val) => val && updateHeader({ fontSize: val })}
              size="small"
            >
              {fontSizes.map((f) => (
                <ToggleButton key={f.value} value={f.value} sx={{ px: 2 }}>
                  {f.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={header.showLastValue}
                onChange={(_, v) => updateHeader({ showLastValue: v })}
                color="primary"
                size="small"
              />
            }
            label="Display 'Last Value' Metric"
          />

          <FormControlLabel
            control={
              <Switch
                checked={header.showChangePercent}
                onChange={(_, v) => updateHeader({ showChangePercent: v })}
                color="primary"
                size="small"
              />
            }
            label="Display 'Period Change %'"
          />
        </Stack>
      )}
    </Stack>
  );
};
