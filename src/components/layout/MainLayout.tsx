import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 72;

/**
 * Main Layout Component
 * Contains sidebar navigation and header
 */
export const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileDrawerOpen(!mobileDrawerOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const sidebarWidth = sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        mobileOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        width={sidebarWidth}
        collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: 0, // Let flexGrow handle the width
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Header */}
        <Header onToggleSidebar={handleToggleSidebar} />

        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            backgroundColor: 'background.default',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
