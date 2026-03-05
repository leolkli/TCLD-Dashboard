import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Skeleton,
  Alert,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { EChartsWidget } from './EChartsWidget';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';

export const ChartPreview: React.FC = () => {
  const { config, previewData, isLoading, error, fetchPreviewData } =
    useWidgetConfigStore();

  const { dataPoints, header, chart } = config;
  const hasData = dataPoints.length > 0 && Object.keys(previewData).length > 0;

  // Compute last value + change for header display
  const lastValueInfo = React.useMemo(() => {
    if (!hasData || !dataPoints[0]) return null;
    const series = previewData[dataPoints[0].code];
    if (!series || series.length < 2) return null;
    const last = series[series.length - 1].value;
    const prev = series[series.length - 2].value;
    const change = last - prev;
    const changePct = prev !== 0 ? (change / prev) * 100 : 0;
    return { last, change, changePct, uom: dataPoints[0].uom };
  }, [hasData, previewData, dataPoints]);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: chart.backgroundColor || 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header Bar */}
      {header.visible && (
        <Box
          sx={{
            px: 2.5,
            pt: 2,
            pb: 1,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography
              variant={
                header.fontSize === 'large'
                  ? 'h5'
                  : header.fontSize === 'small'
                    ? 'body1'
                    : 'h6'
              }
              fontWeight={600}
              color="text.primary"
              noWrap
            >
              {config.general.title || 'Untitled Widget'}
            </Typography>

            {/* Data point chips */}
            {dataPoints.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                {dataPoints.map((dp) => (
                  <Chip
                    key={dp.code}
                    label={dp.name || dp.code}
                    size="small"
                    sx={{
                      bgcolor: `${dp.color}18`,
                      color: dp.color,
                      fontWeight: 500,
                      fontSize: '0.7rem',
                      height: 22,
                    }}
                  />
                ))}
              </Stack>
            )}

            {/* Last value + change */}
            {header.showLastValue && lastValueInfo && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Typography variant="h5" fontWeight={700} color="text.primary">
                  {lastValueInfo.last.toLocaleString(undefined, {
                    maximumFractionDigits: config.scales.precision,
                  })}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {lastValueInfo.uom}
                </Typography>
                {header.showChangePercent && (
                  <Chip
                    size="small"
                    icon={
                      lastValueInfo.change >= 0 ? (
                        <TrendingUpIcon sx={{ fontSize: 14 }} />
                      ) : (
                        <TrendingDownIcon sx={{ fontSize: 14 }} />
                      )
                    }
                    label={`${lastValueInfo.changePct >= 0 ? '+' : ''}${lastValueInfo.changePct.toFixed(2)}%`}
                    color={lastValueInfo.change >= 0 ? 'success' : 'error'}
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
                  />
                )}
              </Box>
            )}
          </Box>

          {/* Refresh button */}
          <Tooltip title="Refresh data">
            <IconButton
              size="small"
              onClick={fetchPreviewData}
              disabled={isLoading || dataPoints.length === 0}
              sx={{ color: 'text.secondary' }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Chart Area */}
      <Box sx={{ flex: 1, minHeight: 0, position: 'relative', px: 1, pb: 1 }}>
        {isLoading && (
          <Box sx={{ p: 2, height: '100%' }}>
            <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 2 }} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {!isLoading && !error && dataPoints.length === 0 && (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 1,
              color: 'text.secondary',
            }}
          >
            <Typography variant="h6" color="text.disabled">
              No Data Points Selected
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Use the Data Points panel to search and add tags
            </Typography>
          </Box>
        )}

        {!isLoading && !error && hasData && (
          <EChartsWidget config={config} data={previewData} height="100%" />
        )}

        {!isLoading && !error && dataPoints.length > 0 && !hasData && (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2" color="text.disabled">
              No readings available for selected tags and date range
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
