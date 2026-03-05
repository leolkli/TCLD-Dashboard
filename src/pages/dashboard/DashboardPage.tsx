import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Bolt as EnergyIcon,
  WaterDrop as WaterIcon,
  AttachMoney as CostIcon,
  Domain as BuildingIcon
} from '@mui/icons-material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { synapseService } from '../../services/synapseService';
import { chartColors } from '../../theme';

// Mock trend data
const trendData = [
  { name: 'Mon', usage: 4000 },
  { name: 'Tue', usage: 3000 },
  { name: 'Wed', usage: 2000 },
  { name: 'Thu', usage: 2780 },
  { name: 'Fri', usage: 1890 },
  { name: 'Sat', usage: 2390 },
  { name: 'Sun', usage: 3490 },
];

const COLORS = chartColors.primary;

const pieData = [
  { name: 'HVAC', value: 400 },
  { name: 'Lighting', value: 300 },
  { name: 'Equipment', value: 300 },
  { name: 'Other', value: 200 },
];

/**
 * Dashboard Page Component
 * Main overview dashboard with KPIs and charts
 */
export const DashboardPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [buildingCount, setBuildingCount] = useState(0);
    const [buildingsData, setBuildingsData] = useState<any[]>([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // Fetch real building hierarchy (with fallback)
                let hierarchy;
                try {
                     hierarchy = await synapseService.getHierarchy();
                } catch (e) {
                    console.warn("API failed, using mock data");
                    hierarchy = [{ buildings: [{code: "TKO", name:"Tseung Kwan O"}, {code:"KMB", name:"KMB"}]}];
                }
                
                // Calculate total buildings (flatten portfolios)
                const buildings = hierarchy.flatMap(p => p.buildings);
                setBuildingCount(buildings.length);
                
                // Prepare comparison data using REAL building names
                const comparisonData = buildings.map(b => ({
                    name: b.code,
                    value: Math.floor(Math.random() * 5000) + 1000 // Mock value for now
                })).slice(0, 10); // Limit to top 10 for display

                setBuildingsData(comparisonData);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Dynamic KPIs based on real counts
    const kpis = [
        {
            title: 'Active Buildings',
            value: buildingCount.toString(),
            unit: 'Site(s)',
            change: 0,
            icon: BuildingIcon,
            color: '#667eea',
        },
        {
          title: 'Total Energy (Est)',
          value: '45,230',
          unit: 'kWh',
          change: -5.2,
          icon: EnergyIcon,
          color: '#3b82f6', // Changed from #667eea to blue
        },
        {
          title: 'Water Usage',
          value: '1,205',
          unit: 'm³',
          change: 2.1,
          icon: WaterIcon,
          color: '#06b6d4',
        },
        {
          title: 'Monthly Cost (Proj)',
          value: '$12,345',
          unit: '',
          change: -3.8,
          icon: CostIcon,
          color: '#10b981',
        },
      ];

  if (loading) {
     return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Energy Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of {buildingCount} monitored facilities across the portfolio.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi) => (
          <Grid item xs={12} sm={6} lg={3} key={kpi.title}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {kpi.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {kpi.value}
                      {kpi.unit && (
                        <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
                          {kpi.unit}
                        </Typography>
                      )}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {kpi.change !== 0 && (
                          <>
                            {kpi.change < 0 ? (
                                <TrendingDownIcon sx={{ color: 'success.main', fontSize: 18, mr: 0.5 }} />
                            ) : (
                                <TrendingUpIcon sx={{ color: 'error.main', fontSize: 18, mr: 0.5 }} />
                            )}
                            <Typography
                                variant="body2"
                                color={kpi.change < 0 ? 'success.main' : 'error.main'}
                                fontWeight={500}
                            >
                                {Math.abs(kpi.change)}% vs last period
                            </Typography>
                          </>
                      )}
                      {kpi.change === 0 && <Chip label="Stable" size="small" variant="outlined" />}
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: `${kpi.color}15`,
                    }}
                  >
                    <kpi.icon sx={{ color: kpi.color, fontSize: 28 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Main Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Portfolio Consumption Trend (Last 7 Days)
              </Typography>
              <Box sx={{ height: 320, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="usage" stroke="#8884d8" name="Energy (kWh)" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Side Chart */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Consumption by Type
              </Typography>
              <Box sx={{ height: 320, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Buildings Comparison */}
        <Grid item xs={12}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Top Buildings by Energy Usage (Mock Data / Live Names)
              </Typography>
              <Box sx={{ height: 320, width: '100%' }}>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={buildingsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Energy (kWh)" fill="#82ca9d" />
                    </BarChart>
                 </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
