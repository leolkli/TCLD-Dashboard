import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import type { Vtag } from '@/types';

// Mock vtags data
const mockVtags: Vtag[] = [
  {
    id: '1',
    name: 'total_energy_kwh',
    displayName: 'Total Energy (kWh)',
    description: 'Sum of all electricity meters',
    unit: 'kWh',
    category: 'energy_consumption',
    buildingId: null,
    currentVersionId: 'v1',
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'energy_per_sqm',
    displayName: 'Energy per m²',
    description: 'Energy efficiency metric normalized by floor area',
    unit: 'kWh/m²',
    category: 'efficiency',
    buildingId: null,
    currentVersionId: 'v1',
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'carbon_emissions',
    displayName: 'Carbon Emissions',
    description: 'CO2 equivalent emissions from energy usage',
    unit: 'kg CO2',
    category: 'environmental',
    buildingId: null,
    currentVersionId: 'v2',
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const categoryColors: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'secondary'> = {
  energy_consumption: 'primary',
  energy_cost: 'warning',
  efficiency: 'success',
  environmental: 'info',
  performance: 'secondary',
  custom: 'secondary',
};

/**
 * Vtag Management Page Component
 * Create and manage virtual tags (calculated metrics)
 */
export const VtagManagementPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredVtags = mockVtags.filter(
    (v) =>
      v.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Virtual Tags (Vtags)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Define calculated metrics from physical tags (Ptags)
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Vtag
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search virtual tags..."
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

      {/* Vtags Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Display Name</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVtags
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((vtag) => (
                    <TableRow key={vtag.id} hover>
                      <TableCell>
                        <Typography fontWeight={500}>{vtag.displayName}</Typography>
                        {vtag.description && (
                          <Typography variant="caption" color="text.secondary">
                            {vtag.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <code style={{ fontSize: '0.85em' }}>{vtag.name}</code>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={vtag.category.replace('_', ' ')}
                          size="small"
                          color={categoryColors[vtag.category] || 'default'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>{vtag.unit}</TableCell>
                      <TableCell>
                        <Chip
                          label={vtag.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={vtag.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={vtag.currentVersionId}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Version History">
                          <IconButton size="small">
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="More">
                          <IconButton size="small">
                            <MoreIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredVtags.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};
