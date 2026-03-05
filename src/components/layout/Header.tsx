import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Badge,
  Tooltip,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Business as BuildingIcon,
  Functions as VtagIcon,
  Widgets as TemplatesIcon,
  People as UsersIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';
import { useState } from 'react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);

  const displayName = user?.displayName || 'User';
  const email = user?.email || '';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSettingsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleSettingsClose();
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
    >
      <Toolbar>
        {/* Menu Toggle */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={onToggleSidebar}
          sx={{ mr: 2, color: 'text.primary' }}
        >
          <MenuIcon />
        </IconButton>

        {/* Page Title - Can be dynamic */}
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, color: 'text.primary' }}
        >
          {/* Page title can be set via context or route */}
        </Typography>

        {/* Settings Menu */}
        <Box>
          <Tooltip title="Settings">
            <IconButton onClick={handleSettingsOpen} sx={{ mr: 1, color: 'text.secondary' }}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={settingsAnchorEl}
            open={Boolean(settingsAnchorEl)}
            onClose={handleSettingsClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 220,
              },
            }}
          >
            <MenuItem onClick={() => handleNavigation('/buildings')}>
              <ListItemIcon>
                <BuildingIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Ptag</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/admin/vtags')}>
               <ListItemIcon>
                <VtagIcon fontSize="small" />
              </ListItemIcon>
               <ListItemText>Vtag</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/admin/templates')}>
              <ListItemIcon>
                <TemplatesIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Dashboard Configuration</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/admin/widget-configurator')}>
              <ListItemIcon>
                <ShowChartIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Widget Configurator</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleNavigation('/admin/users')}>
              <ListItemIcon>
                <UsersIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>User Management</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton sx={{ mr: 1, ml: 1, color: 'text.secondary' }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Menu */}
        <Box>
          <Tooltip title="User Menu">
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 36,
                  height: 36,
                  fontSize: '0.875rem',
                }}
              >
                {initials}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
              },
            }}
          >
            {/* User Info */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
