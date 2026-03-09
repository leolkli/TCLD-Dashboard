import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Box, Paper, Typography, Button, Stack, Tooltip, IconButton, Tabs, Tab, TextField } from '@mui/material';
import { Settings as GeneralIcon, Title as HeaderIcon, ShowChart as ChartIcon, Straighten as ScaleIcon, Refresh as RefreshIcon, RestartAlt as ResetIcon, ContentCopy as CopyIcon, Business as BuildingIcon, Save as SaveIcon, LibraryBooks as LibraryIcon } from '@mui/icons-material';
import { ChartPreview } from '@/components/charts/ChartPreview';
import { BuildingSelector, DataPointSelector, DateRangeSettings, GeneralSettings, HeaderSettings, ChartSettings, ScaleSettings } from '@/components/widget-configurator';
import { WidgetLibraryModal } from '@/components/widget-configurator/WidgetLibraryModal';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import { useBlocker } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

export const WidgetConfiguratorPage: React.FC = () => {
  const { config, fetchPreviewData, resetConfig, saveWidget, isLoading } = useWidgetConfigStore();

  const [tabValue, setTabValue] = useState<number>(0);
  const [libraryModalOpen, setLibraryModalOpen] = useState<boolean>(false);
  const fetchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset config on mount
  useEffect(() => {
    resetConfig();
  }, [resetConfig]);

  // Determine if there are unsaved essential changes
  const hasUnsavedChanges = 
    !config.id && 
    (config.buildingCode !== '' || 
     (config.portfolioName || '') !== '' || 
     config.dataPoints.length > 0 || 
     config.name !== 'New Widget' || 
     config.general.title !== 'New Widget' || 
     config.chart.type !== 'line');

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  // Determine if the current chart relationship requires X & Y axis split (e.g., Scatter plot)
  const isComparing = config.chart.relationship === 'comparing-categories';

  // Build Visual panels (Dynamic based on selected chart type logic)
  const buildPanels = [
    { key: 'building', label: 'Building Filter', icon: <BuildingIcon fontSize="small" />, Component: BuildingSelector },
    { 
      key: 'chart-data', 
      label: 'Chart Type and Data Selection', 
      icon: <ChartIcon fontSize="small" />, 
      Component: () => {
        const { config, updateGeneral } = useWidgetConfigStore();
        return (
        <Stack spacing={4}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>Widget Title</Typography>
            <TextField
              label="Widget Title"
              value={config.general.title}
              onChange={(e) => updateGeneral({ title: e.target.value })}
              fullWidth
              size="small"
            />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>Chart Strategy</Typography>
            <ChartSettings />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
              {isComparing ? 'Y-Axis Data Points' : 'Data Points'}
            </Typography>
            <DataPointSelector axis="y" />{isComparing && (<Box sx={{ mt: 3 }}><Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>X-Axis Data Point</Typography><DataPointSelector axis="x" limit={1} /></Box>)}
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>Aggregation</Typography>
            <DateRangeSettings />
          </Box>
        </Stack>
        )
      } 
    },
  ];

  // Format Visual panels (Purely cosmetic)
  const formatPanels = [
    { key: 'header', label: 'Widget Header Settings', icon: <HeaderIcon fontSize="small" />, Component: HeaderSettings },
    { key: 'visual-formatting', label: 'Visual Formatting', icon: <GeneralIcon fontSize="small" />, Component: GeneralSettings },
    { key: 'scales', label: 'Axes & Scales', icon: <ScaleIcon fontSize="small" />, Component: ScaleSettings },
  ];

  // Debounced fetch when config changes
  useEffect(() => {
    if (config.dataPoints.length === 0) return;
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(() => {
      fetchPreviewData();
    }, 600);
    return () => {
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    };
  }, [
    config.dataPoints,
    config.dateRange.preset, config.dateRange.customStart, config.dateRange.customEnd, config.dateRange.aggregation,
    fetchPreviewData,
  ]);

  const handleCopyJSON = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
  }, [config]);

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', p: 0 }}>
      {/* Top Bar */}
      <Box sx={{ px: 3, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Widget Configurator</Typography>
          <Typography variant="body2" color="text.secondary">Configure and preview chart widgets</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" startIcon={<LibraryIcon />} onClick={() => setLibraryModalOpen(true)}>Library</Button>
          <Tooltip title="Copy config as JSON"><IconButton onClick={handleCopyJSON} size="small" color="primary"><CopyIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Reset all settings"><Button variant="outlined" color="inherit" size="small" startIcon={<ResetIcon />} onClick={resetConfig}>Reset</Button></Tooltip>
          <Button variant="contained" size="small" startIcon={<RefreshIcon />} onClick={fetchPreviewData} disabled={isLoading || config.dataPoints.length === 0}>Fetch Data</Button>
          <Button variant="contained" color="success" size="small" startIcon={<SaveIcon />} onClick={saveWidget} disabled={isLoading || !config.name || config.dataPoints.length === 0}>{config.id ? 'Update Widget' : 'Save Widget'}</Button>
        </Stack>
      </Box>

      {/* Split Layout */}
      <Box sx={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* Left: Chart Preview */}
        <Box sx={{ flex: '0 0 60%', maxWidth: '60%', p: 2, display: 'flex', flexDirection: 'column' }}>
          <Paper elevation={0} sx={{ flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <ChartPreview />
          </Paper>
        </Box>

        {/* Right: Settings Panel with Tabs */}
        <Box sx={{ flex: '0 0 40%', maxWidth: '40%', display: 'flex', flexDirection: 'column', borderLeft: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', overflow: 'hidden' }}>
          
          <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="fullWidth" sx={{ '& .MuiTab-root': { textTransform: 'none', fontSize: '0.95rem', fontWeight: 600 } }}>
              <Tab label="📊 Build Visual" />
              <Tab label="🖌️ Format Visual" />
            </Tabs>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            <Stack spacing={2.5}>
              {(tabValue === 0 ? buildPanels : formatPanels).map(({ key, label, icon, Component }) => (
                <Box key={key}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    {icon}
                    <Typography variant="subtitle2" fontWeight={600}>{label}</Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Component />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Box>

      <WidgetLibraryModal open={libraryModalOpen} onClose={() => setLibraryModalOpen(false)} />

      <Dialog 
        open={blocker.state === 'blocked'} 
        onClose={() => { if (blocker.state === 'blocked') blocker.reset(); }}
      >
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes in your data points, building, chart type, or title. Are you sure you want to leave?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { if (blocker.state === 'blocked') blocker.reset(); }}>Stay</Button>
          <Button variant="contained" onClick={() => { if (blocker.state === 'blocked') blocker.proceed(); }} color="error">Leave</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 
