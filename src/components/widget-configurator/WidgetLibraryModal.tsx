import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon, ShowChart as ChartIcon } from '@mui/icons-material';
import { synapseService } from '@/services/synapseService';
import type { WidgetConfiguration } from '@/types/widget';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';

interface WidgetLibraryModalProps {
  open: boolean;
  onClose: () => void;
}

export const WidgetLibraryModal: React.FC<WidgetLibraryModalProps> = ({ open, onClose }) => {
  const [widgets, setWidgets] = useState<WidgetConfiguration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { config, setConfig } = useWidgetConfigStore(); // Get current configured building context to filter by

  const fetchWidgets = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch specifically for the current configurator scope if set
      const data = await synapseService.getWidgets();
      setWidgets(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch widgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchWidgets();
    }
  }, [open]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this widget?')) return;
    
    try {
      await synapseService.deleteWidget(id);
      setWidgets(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete widget');
    }
  };

  const handleSelectWidget = (widget: WidgetConfiguration) => {
    setConfig(widget);
    onClose();
  };

  // Issue 4: Filter library after user selects building/portfolio
  const filteredWidgets = widgets.filter(w => {
    if (config.widgetScope === 'portfolio') {
      return w.portfolioName === config.portfolioName;
    }
    return w.buildingCode === config.buildingCode;
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>
          Widget Library
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ bgcolor: 'grey.50', minHeight: '400px' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : filteredWidgets.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" color="text.secondary">
            <ChartIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6">No widgets found</Typography>
            <Typography variant="body2">
              No saved widgets match the currently selected {config.widgetScope === 'portfolio' ? 'portfolio' : 'building'}.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 2,
            }}
          >
            {filteredWidgets.map((w) => (
              <Card key={w.id} variant="outlined" sx={{ borderRadius: 2 }}>
                <CardActionArea onClick={() => handleSelectWidget(w)} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <CardContent sx={{ width: '100%', flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ maxWidth: '80%' }}>
                        {w.name || w.general?.title || 'Unnamed Widget'}
                      </Typography>
                      {w.id && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => handleDelete(e, w.id as string)}
                          sx={{ mt: -1, mr: -1 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                      <Chip 
                        label={w.chart?.type.toUpperCase() || 'CHART'} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={`${w.dataPoints?.length || 0} Data Point(s)`} 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {w.widgetScope === 'portfolio' ? `Portfolio: ${w.portfolioName}` : `Building: ${w.buildingCode}`}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
