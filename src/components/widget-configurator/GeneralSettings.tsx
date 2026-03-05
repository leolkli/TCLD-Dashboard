import React from 'react';
import {
  TextField,
  MenuItem,
  Stack,
} from '@mui/material';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';

const refreshOptions = [
  { label: 'Disabled', value: 0 },
  { label: '10 seconds', value: 10 },
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '15 minutes', value: 900 },
];

export const GeneralSettings: React.FC = () => {
  const { config, updateGeneral } = useWidgetConfigStore();
  const { general } = config;

  return (
    <Stack spacing={2}>
      <TextField
        label="Widget Title"
        value={general.title}
        onChange={(e) => updateGeneral({ title: e.target.value })}
        fullWidth
        size="small"
      />
      <TextField
        label="Description"
        value={general.description || ''}
        onChange={(e) => updateGeneral({ description: e.target.value })}
        fullWidth
        size="small"
        multiline
        rows={2}
      />
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
    </Stack>
  );
};
