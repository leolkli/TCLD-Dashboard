import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';

// Mock dashboard pages for a building
const mockDashboardPages = [
  {
    id: 'overview',
    name: 'Overview',
    description: 'General energy performance summary',
    isDefault: true,
  },
  {
    id: 'electricity',
    name: 'Electricity Analysis',
    description: 'Detailed electricity consumption breakdown',
    isDefault: false,
  },
  {
    id: 'hvac',
    name: 'HVAC Performance',
    description: 'Heating, ventilation, and air conditioning metrics',
    isDefault: false,
  },
  {
    id: 'water',
    name: 'Water Usage',
    description: 'Water consumption and efficiency tracking',
    isDefault: false,
  },
  {
    id: 'cost',
    name: 'Cost Analysis',
    description: 'Energy cost breakdown and forecasts',
    isDefault: false,
  },
];

/**
 * Building Detail Page Component
 * Shows building info and list of dashboard pages
 */
export const BuildingDetailPage: React.FC = () => {
  const { buildingId } = useParams<{ buildingId: string }>();
  const navigate = useNavigate();

  // Mock building data - will be replaced with API call
  const building = {
    id: buildingId,
    name: 'Headquarters Tower',
    code: 'HQ-01',
    address: '123 Main Street',
    city: 'Singapore',
  };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 2 }}
      >
        <Link
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigate('/buildings')}
        >
          Buildings
        </Link>
        <Typography color="text.primary">{building.name}</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {building.name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {building.code} • {building.address}, {building.city}
        </Typography>
      </Box>

      {/* Dashboard Pages List */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Dashboard Pages
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select a dashboard page to view detailed analytics
              </Typography>

              <List>
                {mockDashboardPages.map((page) => (
                  <ListItem key={page.id} disablePadding>
                    <ListItemButton
                      onClick={() =>
                        navigate(`/buildings/${buildingId}/dashboard/${page.id}`)
                      }
                      sx={{ borderRadius: 1, mb: 0.5 }}
                    >
                      <ListItemIcon>
                        <DashboardIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {page.name}
                            {page.isDefault && (
                              <Chip label="Default" size="small" color="primary" />
                            )}
                          </Box>
                        }
                        secondary={page.description}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Building Quick Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Stats
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Today's Energy
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  2,345 kWh
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  This Month
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  45,678 kWh
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Active Alerts
                </Typography>
                <Typography variant="h5" fontWeight={600} color="warning.main">
                  3
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
