import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
  Collapse,
  CircularProgress
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Business as BuildingIcon,
  Dashboard as DashboardIcon,
  AccountTree as PortfolioIcon,
} from '@mui/icons-material';
import { synapseService } from '../../services/synapseService';
import type { SynapsePortfolio } from '../../types/synapse';
import type { Dashboard } from '../../types/dashboard';

interface SidebarProps {
  open: boolean;
  mobileOpen: boolean;
  onClose: () => void;
  width: number;
  collapsedWidth: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  mobileOpen,
  onClose,
  width,
  collapsedWidth,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();

  const [portfolios, setPortfolios] = useState<SynapsePortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPortfolios, setExpandedPortfolios] = useState<string[]>([]);
  const [expandedBuildings, setExpandedBuildings] = useState<string[]>([]);
  /** Sub-dashboards keyed by buildingCode */
  const [buildingSubDashboards, setBuildingSubDashboards] = useState<Record<string, Dashboard[]>>({});

  const isCollapsed = !open && !isMobile;
  const currentWidth = isCollapsed ? collapsedWidth : width;

  // Load hierarchy on mount
  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const data = await synapseService.getHierarchy();
        setPortfolios(data);
      } catch (error) {
        console.error('Failed to load hierarchy', error);
        setPortfolios([
          {
            name: 'Demo Portfolio',
            buildings: [
              { code: 'TKO', name: 'Tseung Kwan O' },
              { code: 'KMB', name: 'Kowloon Motor Bus' },
            ],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchHierarchy();
  }, []);

  // When a building expands, fetch its sub-dashboards
  const loadBuildingSubDashboards = async (buildingCode: string) => {
    if (buildingSubDashboards[buildingCode]) return; // already loaded
    try {
      const all = await synapseService.getDashboards({ building: buildingCode });
      const subs = all.filter((d) => d.scope === 'building-sub');
      setBuildingSubDashboards((prev) => ({ ...prev, [buildingCode]: subs }));
    } catch {
      setBuildingSubDashboards((prev) => ({ ...prev, [buildingCode]: [] }));
    }
  };

  const handlePortfolioClick = (portfolioName: string) => {
    if (isCollapsed) return;
    setExpandedPortfolios((prev) =>
      prev.includes(portfolioName)
        ? prev.filter((p) => p !== portfolioName)
        : [...prev, portfolioName],
    );
    // Navigate to portfolio main dashboard
    navigate(`/portfolio/${encodeURIComponent(portfolioName)}/dashboard`);
  };

  const handleBuildingClick = (buildingCode: string) => {
    if (isCollapsed) return;
    const isExpanding = !expandedBuildings.includes(buildingCode);
    setExpandedBuildings((prev) =>
      prev.includes(buildingCode)
        ? prev.filter((b) => b !== buildingCode)
        : [...prev, buildingCode],
    );
    if (isExpanding) {
      loadBuildingSubDashboards(buildingCode);
    }
    // Navigate to building main dashboard
    navigate(`/buildings/${buildingCode}/dashboard`);
  };

  const handleSubDashboardClick = (e: React.MouseEvent, buildingCode: string, dashboardId: string) => {
    e.stopPropagation();
    navigate(`/buildings/${buildingCode}/dashboard/${dashboardId}`);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          minHeight: 64,
        }}
      >
        {!isCollapsed ? (
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            TCLD Energy
          </Typography>
        ) : (
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ color: 'primary.main' }}
          >
            T
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Hierarchy Navigation: Portfolio > Building > Sub-Dashboards */}
      <List sx={{ flexGrow: 1, pt: 1, overflowY: 'auto' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          portfolios.map((portfolio) => {
            const isPortfolioExpanded = expandedPortfolios.includes(portfolio.name);
            const portfolioActive = location.pathname === `/portfolio/${encodeURIComponent(portfolio.name)}/dashboard`;
            return (
              <Box key={portfolio.name}>
                <Tooltip title={isCollapsed ? portfolio.name : ''} placement="right">
                  <ListItemButton
                    onClick={() => handlePortfolioClick(portfolio.name)}
                    selected={portfolioActive}
                    sx={{
                      minHeight: 48,
                      justifyContent: isCollapsed ? 'center' : 'initial',
                      px: 2.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: isCollapsed ? 0 : 2,
                        justifyContent: 'center',
                      }}
                    >
                      <PortfolioIcon />
                    </ListItemIcon>
                    {!isCollapsed && (
                      <>
                        <ListItemText
                          primary={portfolio.name}
                          primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
                        />
                        {isPortfolioExpanded ? <ExpandLess /> : <ExpandMore />}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>

                {/* Buildings under Portfolio */}
                <Collapse in={isPortfolioExpanded && !isCollapsed} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {portfolio.buildings.map((building) => {
                      const isBuildingExpanded = expandedBuildings.includes(building.code);
                      const buildingActive = location.pathname === `/buildings/${building.code}/dashboard`;
                      const subDashboards = buildingSubDashboards[building.code] || [];

                      return (
                        <Box key={building.code}>
                          <ListItemButton
                            onClick={() => handleBuildingClick(building.code)}
                            selected={buildingActive}
                            sx={{ pl: 4, minHeight: 42 }}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <BuildingIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={building.name}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                            {isBuildingExpanded ? (
                              <ExpandLess fontSize="small" />
                            ) : (
                              <ExpandMore fontSize="small" />
                            )}
                          </ListItemButton>

                          {/* Sub-Dashboards under Building */}
                          <Collapse in={isBuildingExpanded} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                              {subDashboards.length === 0 && (
                                <Typography
                                  variant="caption"
                                  color="text.disabled"
                                  sx={{ pl: 8, py: 0.5, display: 'block' }}
                                >
                                  No sub-dashboards
                                </Typography>
                              )}
                              {subDashboards.map((dash) => (
                                <ListItemButton
                                  key={dash.id}
                                  onClick={(e) =>
                                    handleSubDashboardClick(e, building.code, dash.id)
                                  }
                                  selected={
                                    location.pathname ===
                                    `/buildings/${building.code}/dashboard/${dash.id}`
                                  }
                                  sx={{ pl: 6, minHeight: 36 }}
                                >
                                  <ListItemIcon sx={{ minWidth: 28 }}>
                                    <DashboardIcon sx={{ fontSize: 16 }} />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={dash.name}
                                    primaryTypographyProps={{
                                      variant: 'body2',
                                      fontSize: '0.8rem',
                                    }}
                                  />
                                </ListItemButton>
                              ))}
                            </List>
                          </Collapse>
                        </Box>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          })
        )}
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: width,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: currentWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: currentWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};
