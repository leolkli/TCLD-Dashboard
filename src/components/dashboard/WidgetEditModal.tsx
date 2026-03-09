import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { useDashboardGlobalStore } from '@/store/dashboardGlobalStore';
import { useDashboardStore } from '@/store/dashboardStore';
import type { WidgetChartType } from '@/types/widget';

const CHART_TYPES: { value: WidgetChartType; label: string }[] = [
  { value: 'line', label: 'Line Chart' },
  { value: 'bar', label: 'Bar Chart' },
  { value: 'area', label: 'Area Chart' },
  { value: 'kpi', label: 'KPI Card' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'scatter', label: 'Scatter Plot' }
];

export const WidgetEditModal: React.FC = () => {
  const { editingWidgetId, setEditingWidgetId } = useDashboardGlobalStore();
  const { savedWidgets, saveWidget } = useDashboardStore();

  const [localName, setLocalName] = useState('');
  const [localType, setLocalType] = useState<WidgetChartType>('line');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when modal opens for a specific widget
  useEffect(() => {
    if (editingWidgetId) {
      const widget = savedWidgets.find(w => w.id === editingWidgetId);
      if (widget) {
        setLocalName(widget.name);
        setLocalType(widget.chart.type);
      }
    }
  }, [editingWidgetId, savedWidgets]);

  const handleClose = () => {
    setEditingWidgetId(null);
  };

  const handleSave = async () => {
    if (!editingWidgetId) return;
    const widget = savedWidgets.find(w => w.id === editingWidgetId);
    if (!widget) return;

    setIsSaving(true);
    try {
      const updatedConfig = {
        ...widget,
        name: localName,
        chart: {
          ...widget.chart,
          type: localType,
        }
      };
      await saveWidget(updatedConfig);
      handleClose();
    } catch (err) {
      console.error('Failed to update widget', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={!!editingWidgetId} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Widget Configuration</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Widget Name"
            fullWidth
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Chart Type</InputLabel>
            <Select
              value={localType}
              label="Chart Type"
              onChange={(e) => setLocalType(e.target.value as WidgetChartType)}
            >
              {CHART_TYPES.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSaving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
