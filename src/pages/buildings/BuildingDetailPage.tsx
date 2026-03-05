
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TuneIcon from '@mui/icons-material/Tune';
import TimelineIcon from '@mui/icons-material/Timeline';
import CloseIcon from '@mui/icons-material/Close';
import { synapseService, ReadingsResponse } from '@/services/synapseService';
import { BuildingTagsResponse, SynapsePTag } from '@/types/synapse';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const BuildingDetailPage: React.FC = () => {
  const { buildingId } = useParams<{ buildingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const buildingName = location.state?.buildingName || buildingId;

  const [tagsData, setTagsData] = useState<BuildingTagsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

  // Chart State
  const [selectedTag, setSelectedTag] = useState<SynapsePTag | null>(null);
  const [chartData, setChartData] = useState<ReadingsResponse | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  const [chartOpen, setChartOpen] = useState(false);

  useEffect(() => {
    if (!buildingId) return;

    const fetchData = async () => {
      try {
        const data = await synapseService.getBuildingTags(buildingId);
        setTagsData(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch tags.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [buildingId]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleOpenChart = async (tag: SynapsePTag) => {
      setSelectedTag(tag);
      setChartOpen(true);
      setChartLoading(true);
      setChartError(null);
      setChartData(null);

      try {
          // Default: Fetch last month or recent data
          // Ideally use date pickers, but defaulting for now
          const data = await synapseService.getReadings(tag.Code);
          setChartData(data);
      } catch (err: any) {
          console.error(err);
          setChartError(err.message || 'Failed to load readings');
      } finally {
          setChartLoading(false);
      }
  };

  const handleCloseChart = () => {
      setChartOpen(false);
      setSelectedTag(null);
      setChartData(null);
  };

  if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  if (!tagsData) return <Alert severity="warning" sx={{ m: 2 }}>No data found.</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" onClick={() => navigate('/buildings')} sx={{ cursor: 'pointer' }}>
          Buildings
        </Link>
        <Typography color="text.primary">{buildingName}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        {buildingName} <Chip label={buildingId} size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>

      <Paper sx={{ mt: 3, width: '100%' }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="building tags tabs">
          <Tab icon={<AssessmentIcon />} iconPosition="start" label={`Physical Tags (${tagsData.physicalTags.length})`} />
          <Tab icon={<TuneIcon />} iconPosition="start" label="Virtual Tags (0)" disabled />
        </Tabs>

        {/* Physical Tags Panel */}
        <CustomTabPanel value={tabIndex} index={0}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>Tag Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>System</TableCell>
                  <TableCell>UOM</TableCell>
                  <TableCell>Mapped Fact Table</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tagsData.physicalTags.map((tag) => (
                  <TableRow key={tag.Code} hover>
                    <TableCell>
                        <Button 
                            variant="outlined" 
                            size="small" 
                            startIcon={<TimelineIcon />}
                            onClick={() => handleOpenChart(tag)}
                            disabled={!tag.F_tablename}
                        >
                            Plot
                        </Button>
                    </TableCell>
                    <TableCell component="th" scope="row" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tag.Code}>
                      {tag.Code}
                    </TableCell>
                    <TableCell>{tag.Name}</TableCell>
                    <TableCell>{tag.System}</TableCell>
                    <TableCell>{tag.UOM}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                      {tag.F_tablename || <Typography variant="caption" color="error">Not Mapped</Typography>}
                    </TableCell>
                  </TableRow>
                ))}
                {tagsData.physicalTags.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No physical tags found for this building.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CustomTabPanel>
        
        {/* Virtual Tags Panel */}
        <CustomTabPanel value={tabIndex} index={1}>
           <Typography variant="body1">Virtual tags feature coming soon.</Typography>
        </CustomTabPanel>
      </Paper>

      {/* Chart Dialog */}
      <Dialog open={chartOpen} onClose={handleCloseChart} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                    Trend: {selectedTag?.Name}
                </Typography>
                <IconButton onClick={handleCloseChart}>
                    <CloseIcon />
                </IconButton>
            </Box>
            {selectedTag && (
                <Typography variant="caption" display="block" color="textSecondary">
                    {selectedTag.Code} ({selectedTag.UOM})
                </Typography>
            )}
        </DialogTitle>
        <DialogContent dividers>
            {chartLoading ? (
                <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
            ) : chartError ? (
                <Alert severity="error">{chartError}</Alert>
            ) : chartData?.data && chartData.data.length > 0 ? (
                <Box height={400} width="100%">
                    <ResponsiveContainer>
                        <LineChart data={[...chartData.data].reverse()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="timestamp" 
                                tickFormatter={(val) => dayjs(val).format('MM/DD HH:mm')} 
                                minTickGap={30}
                            />
                            <YAxis label={{ value: chartData.uom, angle: -90, position: 'insideLeft' }} />
                            <Tooltip 
                                labelFormatter={(label) => dayjs(label).format('MMM D, YYYY h:mm A')}
                                formatter={(value: number) => [value.toFixed(2), chartData.uom]}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke="#8884d8" name={selectedTag?.Name || "Value"} dot={false} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                    <Typography variant="caption" align="center" display="block" sx={{ mt: 1 }}>
                        Success: Loaded {chartData.count} data points from <code>{chartData.tableName}</code>.
                    </Typography>
                </Box>
            ) : (
                <Alert severity="info" sx={{ my: 2 }}>
                    No data found for this tag in the selected range (Default: Last 30 days). 
                    <br/>
                    Technical Info: Fact Table <code>{selectedTag?.F_tablename}</code> might be empty or data is older than configured window.
                </Alert>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCloseChart}>Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};
