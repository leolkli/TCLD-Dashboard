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
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import type { UserWithRoles } from '@/types';

// Mock user data
const mockUsers: UserWithRoles[] = [
  {
    id: '1',
    entraObjectId: 'aaa-bbb-ccc',
    email: 'admin@tcld.com',
    displayName: 'John Admin',
    firstName: 'John',
    lastName: 'Admin',
    roles: ['super_admin'],
    roleDetails: [],
    buildingAccess: [],
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    entraObjectId: 'ddd-eee-fff',
    email: 'building.manager@tcld.com',
    displayName: 'Jane Manager',
    firstName: 'Jane',
    lastName: 'Manager',
    roles: ['building_admin'],
    roleDetails: [],
    buildingAccess: [],
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    entraObjectId: 'ggg-hhh-iii',
    email: 'user@tcld.com',
    displayName: 'Bob User',
    firstName: 'Bob',
    lastName: 'User',
    roles: ['user'],
    roleDetails: [],
    buildingAccess: [],
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const roleColors: Record<string, 'error' | 'warning' | 'default'> = {
  super_admin: 'error',
  building_admin: 'warning',
  user: 'default',
};

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  building_admin: 'Building Admin',
  user: 'User',
};

/**
 * User Management Page Component
 * List, search, and manage users
 */
export const UserManagementPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredUsers = mockUsers.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage user roles and building access permissions
        </Typography>
      </Box>

      {/* Search and Actions */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search users..."
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

      {/* Users Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {user.displayName.charAt(0)}
                          </Avatar>
                          <Typography fontWeight={500}>{user.displayName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.roles.map((role) => (
                          <Chip
                            key={role}
                            label={roleLabels[role] || role}
                            size="small"
                            color={roleColors[role] || 'default'}
                            sx={{ mr: 0.5 }}
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={user.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : 'Never'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
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
            count={filteredUsers.length}
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
