import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Business as BuildingIcon,
} from '@mui/icons-material';
import type { BuildingWithStats } from '@/types';

// Mock building data - will be replaced with API calls
const mockBuildings: BuildingWithStats[] = [
  {
    id: '1',
    name: 'Headquarters Tower',
    code: 'HQ-01',
    address: '123 Main Street',
    city: 'Singapore',
    country: 'Singapore',
    timezone: 'Asia/Singapore',
    floorCount: 25,
    totalArea: 45000,
    energyType: ['electricity', 'water', 'gas'],
    imageUrl: null,
    isActive: true,
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentEnergyUsage: 12500,
    energyTrend: 'down',
    trendPercentage: 5.2,
    alertCount: 2,
  },
  {
    id: '2',
    name: 'Research Center',
    code: 'RC-01',
    address: '456 Science Park',
    city: 'Singapore',
    country: 'Singapore',
    timezone: 'Asia/Singapore',
    floorCount: 10,
    totalArea: 18000,
    energyType: ['electricity', 'water', 'chilled_water'],
    imageUrl: null,
    isActive: true,
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentEnergyUsage: 8900,
    energyTrend: 'up',
    trendPercentage: 2.1,
    alertCount: 0,
  },
  {
    id: '3',
    name: 'Manufacturing Plant',
    code: 'MP-01',
    address: '789 Industrial Ave',
    city: 'Singapore',
    country: 'Singapore',
    timezone: 'Asia/Singapore',
    floorCount: 3,
    totalArea: 55000,
    energyType: ['electricity', 'gas', 'steam'],
    imageUrl: null,
    isActive: true,
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentEnergyUsage: 45000,
    energyTrend: 'down',
    trendPercentage: 8.5,
    alertCount: 5,
  },
];

/**
 * Buildings Page Component
 * Grid view of all buildings with search and filter
 */
export const BuildingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBuildings = mockBuildings.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Buildings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a building to view detailed energy analytics
        </Typography>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search buildings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Buildings Grid */}
      <Grid container spacing={3}>
        {filteredBuildings.map((building) => (
          <Grid item xs={12} sm={6} lg={4} key={building.id}>
            <Card>
              <CardActionArea onClick={() => navigate(`/buildings/${building.id}`)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* Building Icon */}
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 48,
                        height: 48,
                      }}
                    >
                      <BuildingIcon />
                    </Avatar>

                    {/* Building Info */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {building.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {building.code} • {building.city}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {building.floorCount} floors •{' '}
                        {building.totalArea?.toLocaleString()} m²
                      </Typography>
                    </Box>
                  </Box>

                  {/* Energy Stats */}
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Current Usage
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                          {building.currentEnergyUsage.toLocaleString()} kWh
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {building.energyTrend === 'down' ? (
                          <TrendingDownIcon color="success" fontSize="small" />
                        ) : (
                          <TrendingUpIcon color="error" fontSize="small" />
                        )}
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          color={building.energyTrend === 'down' ? 'success.main' : 'error.main'}
                        >
                          {building.trendPercentage}%
                        </Typography>
                      </Box>
                    </Box>

                    {/* Alerts */}
                    {building.alertCount > 0 && (
                      <Chip
                        label={`${building.alertCount} alerts`}
                        size="small"
                        color="warning"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
