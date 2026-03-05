
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
  Chip
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TuneIcon from '@mui/icons-material/Tune';
import { synapseService } from '@/services/synapseService';
import { BuildingTagsResponse } from '@/types/synapse';

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
                  <TableCell>Tag Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>System</TableCell>
                  <TableCell>UOM</TableCell>
                  <TableCell>Commodity</TableCell>
                  <TableCell>Mapped Fact Table</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tagsData.physicalTags.map((tag) => (
                  <TableRow key={tag.Code} hover>
                    <TableCell component="th" scope="row" sx={{ fontFamily: 'monospace' }}>
                      {tag.Code}
                    </TableCell>
                    <TableCell>{tag.Name}</TableCell>
                    <TableCell>{tag.System}</TableCell>
                    <TableCell>{tag.UOM}</TableCell>
                    <TableCell>{tag.Commodity}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                      {tag.F_tablename}
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
    </Box>
  );
};
