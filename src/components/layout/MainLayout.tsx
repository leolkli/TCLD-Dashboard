import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Grid } from 'antd';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const { useBreakpoint } = Grid;

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 80;

/**
 * Main Layout Component
 * Contains sidebar navigation and header
 */
export const MainLayout: React.FC = () => {
  const screens = useBreakpoint();
  const isMobile = screens.md === false;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileDrawerOpen(!mobileDrawerOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
      <Sidebar
        open={sidebarOpen}
        mobileOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        width={SIDEBAR_WIDTH}
        collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
      />

      <Layout style={{ display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        <Header onToggleSidebar={handleToggleSidebar} />

        <Layout.Content style={{ backgroundColor: '#f0f2f5', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
};
