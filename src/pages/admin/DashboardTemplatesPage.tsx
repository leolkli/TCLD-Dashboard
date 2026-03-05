/**
 * Dashboard Configuration Page
 *
 * Allows users to:
 *  1. Choose scope: portfolio-main, building-main, building-sub
 *  2. Select the target portfolio or building
 *  3. Name the dashboard
 *  4. Drag widgets from a library panel onto a react-grid-layout canvas
 *  5. Resize / rearrange widgets
 *  6. Save the dashboard
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  MenuItem,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ShowChart as WidgetIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useDashboardStore } from '@/store/dashboardStore';
import { createEmptyDashboard } from '@/types/dashboard';
import type { Dashboard, DashboardScope } from '@/types/dashboard';
import type { SynapsePortfolio } from '@/types/synapse';
import { synapseService } from '@/services/synapseService';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const scopeOptions: { value: DashboardScope; label: string }[] = [
  { value: 'portfolio-main', label: 'Portfolio Main Dashboard' },
  { value: 'building-main', label: 'Building Main Dashboard' },
  { value: 'building-sub', label: 'Building Sub-Dashboard' },
];

export const DashboardTemplatesPage: React.FC = () => {
  // ── Stores ───────────────────────────────────────────────────
  const {
    currentDashboard,
    savedWidgets,
    dashboards,
    isLoading,
    saveDashboard,
    fetchAllDashboards,
    fetchSavedWidgets,
    setCurrentDashboard,
    addWidgetToDashboard,
    removeWidgetFromDashboard,
    updateLayout,
    deleteDashboard,
    deleteWidget,
  } = useDashboardStore();

  // ── Local state ──────────────────────────────────────────────
  const [scope, setScope] = useState<DashboardScope>('building-main');
  const [portfolios, setPortfolios] = useState<SynapsePortfolio[]>([]);
  const [buildingsList, setBuildingsList] = useState<{ code: string; name: string }[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [dashboardName, setDashboardName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'dashboard' | 'widget'; id: string; name: string } | null>(null);

  // ── Init: load hierarchy + existing dashboards + widgets ─────
  useEffect(() => {
    const init = async () => {
      try {
        const hierarchy = await synapseService.getHierarchy();
        setPortfolios(hierarchy);
        // Flatten buildings
        const allBuildings: { code: string; name: string }[] = [];
        hierarchy.forEach((p) =>
          p.buildings.forEach((b) => {
            if (!allBuildings.find((x) => x.code === b.code)) {
              allBuildings.push(b);
            }
          }),
        );
        setBuildingsList(allBuildings);
      } catch {
        setPortfolios([]);
        setBuildingsList([]);
      }
      fetchAllDashboards();
      fetchSavedWidgets();
    };
    init();
  }, [fetchAllDashboards, fetchSavedWidgets]);

  // ── When scope / target changes, try to load existing dashboard ─
  useEffect(() => {
    let match: Dashboard | undefined;
    if (scope === 'portfolio-main' && selectedPortfolio) {
      match = dashboards.find(
        (d) => d.scope === 'portfolio-main' && d.portfolioName === selectedPortfolio,
      );
    } else if (scope === 'building-main' && selectedBuilding) {
      match = dashboards.find(
        (d) => d.scope === 'building-main' && d.buildingCode === selectedBuilding,
      );
    }

    if (match) {
      setCurrentDashboard(match);
      setDashboardName(match.name);
    } else if (scope !== 'building-sub') {
      // Start fresh
      setCurrentDashboard(null);
      setDashboardName('');
    }
  }, [scope, selectedPortfolio, selectedBuilding, dashboards, setCurrentDashboard]);

  // Filter existing sub-dashboards for selected building
  const existingSubDashboards = dashboards.filter(
    (d) => d.scope === 'building-sub' && d.buildingCode === selectedBuilding,
  );

  // ── Handlers ─────────────────────────────────────────────────
  const handleNewDashboard = useCallback(() => {
    const buildingName = buildingsList.find((b) => b.code === selectedBuilding)?.name;
    const dash = createEmptyDashboard(scope, {
      name: dashboardName || 'Untitled Dashboard',
      portfolioName: scope === 'portfolio-main' ? selectedPortfolio : undefined,
      buildingCode: scope !== 'portfolio-main' ? selectedBuilding : undefined,
      buildingName: scope !== 'portfolio-main' ? buildingName : undefined,
    });
    setCurrentDashboard(dash);
    setDashboardName(dash.name);
  }, [scope, selectedPortfolio, selectedBuilding, dashboardName, buildingsList, setCurrentDashboard]);

  const handleSave = useCallback(async () => {
    if (!currentDashboard) return;
    setSaveSuccess(false);
    try {
      const buildingName = buildingsList.find((b) => b.code === selectedBuilding)?.name;
      await saveDashboard({
        ...currentDashboard,
        name: dashboardName || currentDashboard.name,
        portfolioName: scope === 'portfolio-main' ? selectedPortfolio : currentDashboard.portfolioName,
        buildingCode: scope !== 'portfolio-main' ? selectedBuilding : currentDashboard.buildingCode,
        buildingName: scope !== 'portfolio-main' ? buildingName : currentDashboard.buildingName,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // error handled by store
    }
  }, [currentDashboard, dashboardName, scope, selectedPortfolio, selectedBuilding, buildingsList, saveDashboard]);

  const handleLayoutChange = useCallback(
    (layout: Layout[]) => {
      updateLayout(layout);
    },
    [updateLayout],
  );

  const handleLoadSubDashboard = useCallback(
    (dash: Dashboard) => {
      setCurrentDashboard(dash);
      setDashboardName(dash.name);
    },
    [setCurrentDashboard],
  );

  // ── Delete confirmation helpers ──────────────────────────────
  const handleDeleteRequest = useCallback((type: 'dashboard' | 'widget', id: string, name: string) => {
    setDeleteTarget({ type, id, name });
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'dashboard') {
      await deleteDashboard(deleteTarget.id);
    } else {
      await deleteWidget(deleteTarget.id);
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  }, [deleteTarget, deleteDashboard, deleteWidget]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  }, []);

  // ── Layout data for react-grid-layout ────────────────────────
  const layouts = {
    lg: currentDashboard?.layout || [],
  };

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
            Dashboard Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and edit dashboards — drag widgets onto the canvas
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          {saveSuccess && (
            <Chip label="Saved!" color="success" size="small" variant="outlined" />
          )}
          {currentDashboard && (
            <Tooltip title="Delete this dashboard">
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() =>
                  handleDeleteRequest('dashboard', currentDashboard.id, currentDashboard.name)
                }
              >
                Delete
              </Button>
            </Tooltip>
          )}
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!currentDashboard || isLoading}
          >
            Save Dashboard
          </Button>
        </Stack>
      </Box>

      {/* Main Split */}
      <Box sx={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* ─── Left Panel: Settings + Widget Library (30%) ────── */}
        <Box
          sx={{
            flex: '0 0 300px',
            width: 300,
            overflow: 'auto',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'grey.50',
            p: 2,
          }}
        >
          {/* Scope & Target selectors */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Dashboard Settings
          </Typography>

          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <TextField
              select
              label="Scope"
              value={scope}
              onChange={(e) => {
                setScope(e.target.value as DashboardScope);
                setCurrentDashboard(null);
                setDashboardName('');
              }}
              size="small"
              fullWidth
            >
              {scopeOptions.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>

            {scope === 'portfolio-main' && (
              <TextField
                select
                label="Portfolio"
                value={selectedPortfolio}
                onChange={(e) => setSelectedPortfolio(e.target.value)}
                size="small"
                fullWidth
              >
                <MenuItem value="">Select portfolio…</MenuItem>
                {portfolios.map((p) => (
                  <MenuItem key={p.name} value={p.name}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {scope !== 'portfolio-main' && (
              <TextField
                select
                label="Building"
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                size="small"
                fullWidth
              >
                <MenuItem value="">Select building…</MenuItem>
                {buildingsList.map((b) => (
                  <MenuItem key={b.code} value={b.code}>
                    {b.name} ({b.code})
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              label="Dashboard Name"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              size="small"
              fullWidth
            />

            {!currentDashboard && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleNewDashboard}
                disabled={
                  (scope === 'portfolio-main' && !selectedPortfolio) ||
                  (scope !== 'portfolio-main' && !selectedBuilding)
                }
              >
                New Dashboard
              </Button>
            )}
          </Stack>

          {/* Existing sub-dashboards for quick load */}
          {scope === 'building-sub' && selectedBuilding && existingSubDashboards.length > 0 && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Existing Sub-Dashboards
              </Typography>
              <List dense>
                {existingSubDashboards.map((d) => (
                  <ListItemButton
                    key={d.id}
                    selected={currentDashboard?.id === d.id}
                    onClick={() => handleLoadSubDashboard(d)}
                    sx={{ borderRadius: 1.5, mb: 0.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <DashboardIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={d.name}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRequest('dashboard', d.id, d.name);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemButton>
                ))}
              </List>
            </>
          )}

          <Divider sx={{ my: 1.5 }} />

          {/* Widget Library */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Widget Library
          </Typography>
          {savedWidgets.length === 0 ? (
            <Typography variant="caption" color="text.disabled">
              No saved widgets. Create widgets in the Widget Configurator first.
            </Typography>
          ) : (
            <List dense>
              {savedWidgets.map((w) => (
                <ListItemButton
                  key={w.id}
                  onClick={() => {
                    if (!currentDashboard) return;
                    addWidgetToDashboard(w.id!, w.name);
                  }}
                  disabled={!currentDashboard}
                  sx={{ borderRadius: 1.5, mb: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <WidgetIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={w.name}
                    secondary={`${w.portfolioName || w.buildingName || 'No scope'} · ${w.chart.type}`}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Stack direction="row" spacing={0} alignItems="center">
                    <Tooltip title="Add to dashboard">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!currentDashboard) return;
                          addWidgetToDashboard(w.id!, w.name);
                        }}
                        disabled={!currentDashboard}
                      >
                        <AddIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete widget">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRequest('widget', w.id!, w.name);
                        }}
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>

        {/* ─── Right Panel: Canvas (remaining width) ────────── */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: 'background.default' }}>
          {!currentDashboard ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Alert severity="info" sx={{ maxWidth: 500 }}>
                Select a scope and target, then click <strong>New Dashboard</strong> — or
                load an existing sub-dashboard from the left panel.
              </Alert>
            </Box>
          ) : currentDashboard.widgets.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Alert severity="info" sx={{ maxWidth: 500 }}>
                Click widgets from the <strong>Widget Library</strong> on the left to add
                them to the canvas.
              </Alert>
            </Box>
          ) : (
            <ResponsiveGridLayout
              className="layout"
              layouts={layouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={80}
              isDraggable
              isResizable
              onLayoutChange={handleLayoutChange}
              compactType="vertical"
              draggableHandle=".widget-drag-handle"
            >
              {currentDashboard.widgets.map((wi) => {
                const widgetConfig = savedWidgets.find((w) => w.id === wi.widgetId);
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
                    {/* Drag handle + delete */}
                    <Box
                      className="widget-drag-handle"
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'grey.50',
                        cursor: 'grab',
                        '&:active': { cursor: 'grabbing' },
                      }}
                    >
                      <Typography variant="caption" fontWeight={600} noWrap>
                        {widgetConfig?.general.title || wi.widgetName}
                      </Typography>
                      <Tooltip title="Remove from dashboard">
                        <IconButton
                          size="small"
                          onClick={() => removeWidgetFromDashboard(wi.layoutId)}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    {/* Chart placeholder */}
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 0,
                        bgcolor: 'background.paper',
                        color: 'text.secondary',
                      }}
                    >
                      <Stack alignItems="center" spacing={0.5}>
                        <WidgetIcon sx={{ fontSize: 28, opacity: 0.4 }} />
                        <Typography variant="caption">
                          {widgetConfig?.chart.type || 'chart'} — {widgetConfig?.dataPoints.length || 0} tags
                        </Typography>
                      </Stack>
                    </Box>
                  </Paper>
                );
              })}
            </ResponsiveGridLayout>
          )}
        </Box>
      </Box>

      {/* ── Delete Confirmation Dialog ──────────────────────── */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="xs" fullWidth>
        <DialogTitle>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the {deleteTarget?.type}{' '}
            <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
