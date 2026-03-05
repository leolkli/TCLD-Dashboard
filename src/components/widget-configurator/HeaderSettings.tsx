import React from 'react';
import {
  Box,
  FormControlLabel,
  Switch,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Stack,
} from '@mui/material';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import type { HeaderFontSize } from '@/types/widget';

const fontSizes: { label: string; value: HeaderFontSize }[] = [
  { label: 'S', value: 'small' },
  { label: 'M', value: 'medium' },
  { label: 'L', value: 'large' },
];

export const HeaderSettings: React.FC = () => {
  const { config, updateHeader } = useWidgetConfigStore();
  const { header } = config;

  return (
    <Stack spacing={1.5}>
      <FormControlLabel
        control={
          <Switch
            checked={header.visible}
            onChange={(_, v) => updateHeader({ visible: v })}
            color="primary"
          />
        }
        label="Show Header"
      />

      {header.visible && (
        <>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Title Size
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
            label="Show Last Value"
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
            label="Show Change %"
          />
        </>
      )}
    </Stack>
  );
};
