import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Stack, 
  MenuItem, 
  Select, 
  FormControl, 
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { useDashboardGlobalStore } from '@/store/dashboardGlobalStore';
import { useDashboardStore } from '@/store/dashboardStore';
import type { DateRangePreset } from '@/types/widget';

const PRESETS: { label: string; value: DateRangePreset }[] = [
  { label: 'Today', value: '1D' },
  { label: 'Last 7 Days', value: '1W' },
  { label: 'Last 30 Days', value: '1M' },
  { label: 'Last 3 Months', value: '3M' },
  { label: 'Last 6 Months', value: '6M' },
  { label: 'Last Year', value: '1Y' },
  { label: 'All Time', value: 'ALL' },
];

export const DashboardToolbar: React.FC = () => {
  const { 
    isEditMode, 
    setEditMode, 
    globalFilters, 
    setGlobalDateRangePreset,
    setGlobalDateRangeCustom,
    setWidgetLibraryOpen 
  } = useDashboardGlobalStore();
  const { currentDashboard, saveDashboard } = useDashboardStore();
  const [isSaving, setIsSaving] = useState(false);

  // Custom date picker state
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [tempStart, setTempStart] = useState(globalFilters.dateRange.customStart || '');
  const [tempEnd, setTempEnd] = useState(globalFilters.dateRange.customEnd || '');

  const handleDatePresetChange = (value: string) => {
    if (value === 'custom') {
      setCustomDialogOpen(true);
    } else {
      setGlobalDateRangePreset(value as DateRangePreset);
    }
  };

  const handleApplyCustomDate = () => {
    setGlobalDateRangeCustom(tempStart, tempEnd);
    setCustomDialogOpen(false);
  };

  const handleSave = async () => {
    if (!currentDashboard) return;
    setIsSaving(true);
    try {
      await saveDashboard(currentDashboard);
      setEditMode(false);
    } catch (error) {
      console.error("Failed to save dashboard", error);
      // maybe add toast notification here
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        mb: 3,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}
    >
      {/* Left side: Title and Status */}
      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography variant="h5" fontWeight={700}>
          {currentDashboard?.name || 'Dashboard'}
        </Typography>
        {isEditMode && (
          <Chip label="Editing Layout" color="warning" size="small" variant="outlined" />
        )}
      </Stack>

      {/* Right side: Global Filters & Actions */}
      <Stack direction="row" alignItems="center" spacing={2}>
        {/* Global Date Filter */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={globalFilters.dateRange.preset}
            onChange={(e) => handleDatePresetChange(e.target.value as string)}
            displayEmpty
            startAdornment={<CalendarMonthIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
            sx={{ 
              bgcolor: 'background.default',
              '.MuiSelect-select': { display: 'flex', alignItems: 'center' }
            }}
          >
            {PRESETS.map((preset) => (
              <MenuItem key={preset.value} value={preset.value}>
                {preset.label}
              </MenuItem>
            ))}
            <MenuItem value="custom">Custom Range</MenuItem>
          </Select>
        </FormControl>

        {/* Action Buttons */}
        {isEditMode ? (
          <>
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />}
              onClick={() => setWidgetLibraryOpen(true)}
            >
              Add Widget
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Layout'}
            </Button>
            <Button 
              variant="text" 
              color="inherit"
              onClick={() => setEditMode(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            onClick={() => setEditMode(true)}
          >
            Edit Layout
          </Button>
        )}
      </Stack>

      <Dialog open={customDialogOpen} onClose={() => setCustomDialogOpen(false)}>
        <DialogTitle>Select Custom Date Range</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={tempStart}
              onChange={(e) => setTempStart(e.target.value)}
            />
            <TextField
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={tempEnd}
              onChange={(e) => setTempEnd(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleApplyCustomDate}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
