import React, { useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Stack,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  DataObject as DataIcon,
  AspectRatio as SizeIcon,
  DateRange as DateRangeIcon,
  Settings as GeneralIcon,
  Title as HeaderIcon,
  ShowChart as ChartIcon,
  CompareArrows as CompareIcon,
  Straighten as ScaleIcon,
  Refresh as RefreshIcon,
  RestartAlt as ResetIcon,
  ContentCopy as CopyIcon,
  Business as BuildingIcon,
  Save as SaveIcon,
  LibraryBooks as LibraryIcon,
} from '@mui/icons-material';
import { ChartPreview } from '@/components/charts/ChartPreview';
import {
  BuildingSelector,
  DataPointSelector,
  SizeSettings,
  DateRangeSettings,
  GeneralSettings,
  HeaderSettings,
  ChartSettings,
  ComparisonSettings,
  ScaleSettings,
} from '@/components/widget-configurator';
import { WidgetLibraryModal } from '@/components/widget-configurator/WidgetLibraryModal';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';

// Settings panel definition
const settingsPanels = [
  { key: 'building', label: 'Building', icon: <BuildingIcon fontSize="small" />, Component: BuildingSelector },
  { key: 'data', label: 'Data Points', icon: <DataIcon fontSize="small" />, Component: DataPointSelector },
  { key: 'general', label: 'General', icon: <GeneralIcon fontSize="small" />, Component: GeneralSettings },
  { key: 'chart', label: 'Chart Type', icon: <ChartIcon fontSize="small" />, Component: ChartSettings },
  { key: 'dateRange', label: 'Date Range', icon: <DateRangeIcon fontSize="small" />, Component: DateRangeSettings },
  { key: 'header', label: 'Header', icon: <HeaderIcon fontSize="small" />, Component: HeaderSettings },
  { key: 'comparison', label: 'Comparison', icon: <CompareIcon fontSize="small" />, Component: ComparisonSettings },
  { key: 'scales', label: 'Scales', icon: <ScaleIcon fontSize="small" />, Component: ScaleSettings },
  { key: 'size', label: 'Size & Layout', icon: <SizeIcon fontSize="small" />, Component: SizeSettings },
];

export const WidgetConfiguratorPage: React.FC = () => {
  const {
    config,
    fetchPreviewData,
    resetConfig,
    saveWidget,
    isLoading,
  } = useWidgetConfigStore();

  const [expanded, setExpanded] = React.useState<string | false>('building');
  const [libraryModalOpen, setLibraryModalOpen] = React.useState<boolean>(false);
  const fetchTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    config.dateRange.preset,
    config.dateRange.customStart,
    config.dateRange.customEnd,
    config.dateRange.aggregation,
    fetchPreviewData,
  ]);

  const handleAccordionChange = useCallback(
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    },
    [],
  );

  const handleCopyJSON = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
  }, [config]);

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', p: 0 }}>
      {/* Top Bar */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Widget Configurator
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure and preview chart widgets
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LibraryIcon />}
            onClick={() => setLibraryModalOpen(true)}
          >
            Library
          </Button>
          <Tooltip title="Copy config as JSON">
            <IconButton onClick={handleCopyJSON} size="small" color="primary">
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset all settings">
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<ResetIcon />}
              onClick={resetConfig}
            >
              Reset
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchPreviewData}
            disabled={isLoading || config.dataPoints.length === 0}
          >
            Fetch Data
          </Button>
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<SaveIcon />}
            onClick={saveWidget}
            disabled={isLoading || !config.name || config.dataPoints.length === 0}
          >
            {config.id ? 'Update Widget' : 'Save Widget'}
          </Button>
        </Stack>
      </Box>

      {/* Split Layout */}
      <Box sx={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* Left: Chart Preview (60%) */}
        <Box
          sx={{
            flex: '0 0 60%',
            maxWidth: '60%',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <ChartPreview />
          </Paper>
        </Box>

        {/* Right: Settings Panel (40%) — scrollable */}
        <Box
          sx={{
            flex: '0 0 40%',
            maxWidth: '40%',
            overflow: 'auto',
            borderLeft: '1px solid',
            borderColor: 'divider',
            bgcolor: 'grey.50',
            p: 2,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, px: 0.5 }}>
            Settings
          </Typography>

          {settingsPanels.map(({ key, label, icon, Component }) => (
            <Accordion
              key={key}
              expanded={expanded === key}
              onChange={handleAccordionChange(key)}
              disableGutters
              elevation={0}
              sx={{
                mb: 1,
                borderRadius: '12px !important',
                border: '1px solid',
                borderColor: expanded === key ? 'primary.main' : 'grey.200',
                '&:before': { display: 'none' },
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  minHeight: 44,
                  '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1, my: 0.5 },
                  bgcolor: expanded === key ? 'primary.main' : 'background.paper',
                  color: expanded === key ? 'primary.contrastText' : 'text.primary',
                  '& .MuiSvgIcon-root': {
                    color: expanded === key ? 'primary.contrastText' : 'text.secondary',
                  },
                }}
              >
                {icon}
                <Typography variant="body2" fontWeight={600}>
                  {label}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Component />
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>

      {/* Widget Library Modal */}
      <WidgetLibraryModal 
        open={libraryModalOpen} 
        onClose={() => setLibraryModalOpen(false)} 
      />
    </Box>
  );
};
