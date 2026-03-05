import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import { TagSearchDialog } from './TagSearchDialog';

export const DataPointSelector: React.FC = () => {
  const { config, removeDataPoint, updateDataPointColor } = useWidgetConfigStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRemove = useCallback(
    (code: string) => removeDataPoint(code),
    [removeDataPoint],
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {config.dataPoints.length} tag{config.dataPoints.length !== 1 ? 's' : ''} selected
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          disabled={config.dataPoints.length >= 10}
        >
          Add Tag
        </Button>
      </Box>

      {config.dataPoints.length === 0 && (
        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'grey.300',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
            transition: 'all 0.2s',
          }}
          onClick={() => setDialogOpen(true)}
        >
          <AddIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 0.5 }} />
          <Typography variant="body2" color="text.disabled">
            Click to search &amp; add data points
          </Typography>
        </Box>
      )}

      <Stack spacing={1} sx={{ mt: 1 }}>
        {config.dataPoints.map((dp) => (
          <Box
            key={dp.code}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              borderRadius: 1.5,
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            {/* Color dot / picker */}
            <Tooltip title="Click to change color">
              <Box
                component="input"
                type="color"
                value={dp.color}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateDataPointColor(dp.code, e.target.value)
                }
                sx={{
                  width: 24,
                  height: 24,
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  p: 0,
                  '&::-webkit-color-swatch': { borderRadius: '50%', border: 'none' },
                  '&::-webkit-color-swatch-wrapper': { p: 0 },
                }}
              />
            </Tooltip>

            {/* Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {dp.name || dp.code}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {dp.building} &middot; {dp.system} &middot; {dp.uom}
              </Typography>
            </Box>

            {/* Remove */}
            <IconButton size="small" onClick={() => handleRemove(dp.code)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Stack>

      <TagSearchDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
};
