/**
 * DashboardViewerPage
 *
 * Renders a saved dashboard layout using react-grid-layout.
 * Resolves widget configs from the saved widget library and renders ECharts charts.
 *
 * Used for:
 *   /portfolio/:portfolioName/dashboard   → portfolio-main dashboard
 *   /buildings/:code/dashboard            → building-main dashboard
 *   /buildings/:code/dashboard/:dashId    → building sub-dashboard
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Responsive, WidthProvider } from 'react-grid-layout';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { EChartsWidget } from '@/components/charts/EChartsWidget';
import { useDashboardStore } from '@/store/dashboardStore';
import type { Dashboard } from '@/types/dashboard';
import type { WidgetConfiguration } from '@/types/widget';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export const DashboardViewerPage: React.FC = () => {
  const { portfolioName, code: buildingCode, dashId } = useParams<{
    portfolioName?: string;
    code?: string;
    dashId?: string;
  }>();

  const {
    currentDashboard,
    savedWidgets,
    isLoading,
    error,
    fetchDashboard,
    fetchSavedWidgets,
    setCurrentDashboard,
  } = useDashboardStore();

  const [resolvedWidgets, setResolvedWidgets] = useState<
    Map<string, WidgetConfiguration>
  >(new Map());

  // Determine which dashboard to load
  useEffect(() => {
    const loadDashboard = async () => {
      if (dashId) {
        // Specific sub-dashboard by ID
        await fetchDashboard(dashId);
        return;
      }

      // Load by scope: find the main dashboard for this portfolio or building
      try {
        let dashboards: Dashboard[] = [];
        if (portfolioName) {
          const { getDashboards } = await import('@/services/synapseService').then(
            (m) => m.synapseService,
          );
          dashboards = await getDashboards({ portfolio: decodeURIComponent(portfolioName), scope: 'portfolio-main' });
        } else if (buildingCode) {
          const { getDashboards } = await import('@/services/synapseService').then(
            (m) => m.synapseService,
          );
          dashboards = await getDashboards({ building: buildingCode, scope: 'building-main' });
        }
        if (dashboards.length > 0) {
          setCurrentDashboard(dashboards[0]);
        } else {
          setCurrentDashboard(null);
        }
      } catch {
        setCurrentDashboard(null);
      }
    };

    loadDashboard();
  }, [portfolioName, buildingCode, dashId, fetchDashboard, setCurrentDashboard]);

  // Fetch widget library when dashboard loads
  useEffect(() => {
    if (currentDashboard) {
      fetchSavedWidgets();
    }
  }, [currentDashboard, fetchSavedWidgets]);

  // Resolve widget configs for the dashboard instances
  useEffect(() => {
    if (!currentDashboard || savedWidgets.length === 0) return;
    const map = new Map<string, WidgetConfiguration>();
    currentDashboard.widgets.forEach((wi) => {
      const found = savedWidgets.find((w) => w.id === wi.widgetId);
      if (found) {
        map.set(wi.layoutId, found);
      }
    });
    setResolvedWidgets(map);
  }, [currentDashboard, savedWidgets]);

  // Build layout for react-grid-layout
  const layouts = useMemo(() => {
    if (!currentDashboard) return { lg: [] };
    return { lg: currentDashboard.layout };
  }, [currentDashboard]);

  const title = currentDashboard?.name
    || (portfolioName ? `${decodeURIComponent(portfolioName)} Dashboard` : '')
    || (buildingCode ? `${buildingCode} Dashboard` : 'Dashboard');

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentDashboard) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        <Alert severity="info" sx={{ maxWidth: 600 }}>
          No dashboard has been configured yet. Go to{' '}
          <strong>Settings &rarr; Dashboard Configuration</strong> to create one.
        </Alert>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        {currentDashboard.name}
      </Typography>

      {currentDashboard.widgets.length === 0 ? (
        <Alert severity="info" sx={{ maxWidth: 600 }}>
          This dashboard has no widgets yet. Go to{' '}
          <strong>Settings &rarr; Dashboard Configuration</strong> to add widgets.
        </Alert>
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={80}
          isDraggable={false}
          isResizable={false}
          compactType="vertical"
        >
          {currentDashboard.widgets.map((wi) => {
            const widgetConfig = resolvedWidgets.get(wi.layoutId);
            return (
              <Paper
                key={wi.layoutId}
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                {/* Widget header */}
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'grey.50',
                  }}
                >
                  <Typography variant="caption" fontWeight={600}>
                    {widgetConfig?.general.title || wi.widgetName}
                  </Typography>
                </Box>
                {/* Widget chart */}
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  {widgetConfig ? (
                    <EChartsWidget config={widgetConfig} data={{}} />
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: 'text.disabled',
                      }}
                    >
                      <Typography variant="caption">Widget not found</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            );
          })}
        </ResponsiveGridLayout>
      )}
    </Box>
  );
};
