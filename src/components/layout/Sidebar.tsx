import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Drawer, Typography, Spin, Grid } from 'antd';
import type { MenuProps } from 'antd';
import {
  BankOutlined,
  AppstoreOutlined,
  FundProjectionScreenOutlined
} from '@ant-design/icons';
import { synapseService } from '../../services/synapseService';
import type { SynapsePortfolio } from '../../types/synapse';
import type { Dashboard } from '../../types/dashboard';

const { Sider } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

interface SidebarProps {
  open: boolean;
  mobileOpen: boolean;
  onClose: () => void;
  width: number;
  collapsedWidth: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  mobileOpen,
  onClose,
  width,
  collapsedWidth,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = screens.md === false;

  const [portfolios, setPortfolios] = useState<SynapsePortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [buildingSubDashboards, setBuildingSubDashboards] = useState<Record<string, Dashboard[]>>({});
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const isCollapsed = !open && !isMobile;

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const data = await synapseService.getHierarchy();
        setPortfolios(data);
      } catch (error) {
        console.error('Failed to load hierarchy', error);
        setPortfolios([
          {
            name: 'Demo Portfolio',
            buildings: [
              { code: 'TKO', name: 'Tseung Kwan O' },
              { code: 'KMB', name: 'Kowloon Motor Bus' },
            ],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchHierarchy();
  }, []);

  const loadBuildingSubDashboards = async (buildingCode: string) => {
    if (buildingSubDashboards[buildingCode]) return;
    try {
      const all = await synapseService.getDashboards({ building: buildingCode });
      const subs = all.filter((d) => d.scope === 'building-sub');
      setBuildingSubDashboards((prev) => ({ ...prev, [buildingCode]: subs }));
    } catch {
      setBuildingSubDashboards((prev) => ({ ...prev, [buildingCode]: [] }));
    }
  };

  const handleOpenChange = (keys: string[]) => {
    keys.forEach(key => {
      if (key.startsWith('building-')) {
        const code = key.replace('building-', '');
        loadBuildingSubDashboards(code);
      }
    });
    setOpenKeys(keys);
  };

  const getSelectedKeys = () => {
    if (location.pathname.includes('/portfolio/')) {
      const match = location.pathname.match(/\/portfolio\/(.+)\/dashboard/);
      if (match) return [`portfolio-${decodeURIComponent(match[1])}`];
    }
    if (location.pathname.includes('/dashboard/')) {
      const match = location.pathname.match(/\/buildings\/(.+)\/dashboard\/(.+)/);
      if (match) return [`dashboard-${match[1]}-${match[2]}`];
    }
    if (location.pathname.includes('/buildings/')) {
      const match = location.pathname.match(/\/buildings\/(.+)\/dashboard/);
      if (match) return [`building-${match[1]}`];
    }
    return [];
  };

  const menuItems: MenuProps['items'] = portfolios.map((portfolio) => ({
    key: `portfolio-${portfolio.name}`,
    icon: <AppstoreOutlined />,
    label: portfolio.name,
    onTitleClick: () => {
      navigate(`/portfolio/${encodeURIComponent(portfolio.name)}/dashboard`);
      if (isMobile) onClose();
    },
    children: portfolio.buildings.map((building) => {
      const subDashboards = buildingSubDashboards[building.code];
      let subChildren: MenuProps['items'];
      
      if (!subDashboards) {
        subChildren = [{ key: `loading-${building.code}`, label: <Spin size="small" />, disabled: true }];
      } else if (subDashboards.length === 0) {
        subChildren = [{ key: `empty-${building.code}`, label: 'No sub-dashboards', disabled: true }];
      } else {
        subChildren = subDashboards.map(dash => ({
          key: `dashboard-${building.code}-${dash.id}`,
          icon: <FundProjectionScreenOutlined />,
          label: dash.name,
          onClick: () => {
            navigate(`/buildings/${building.code}/dashboard/${dash.id}`);
            if (isMobile) onClose();
          }
        }));
      }

      return {
        key: `building-${building.code}`,
        icon: <BankOutlined />,
        label: building.name,
        onTitleClick: () => {
          navigate(`/buildings/${building.code}/dashboard`);
          if (isMobile) onClose();
        },
        children: subChildren
      };
    })
  }));

  const renderLogo = (collapsed: boolean) => (
    <div style={{
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: collapsed ? 'center' : 'flex-start',
      height: 64,
      overflow: 'hidden',
      flexShrink: 0
    }}>
      {!collapsed ? (
        <Title level={4} style={{ margin: 0, whiteSpace: 'nowrap', background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          TCLD Energy
        </Title>
      ) : (
        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>T</Title>
      )}
    </div>
  );

  const menuContent = (
    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
          <Spin />
        </div>
      ) : (
        <Menu
          mode="inline"
          theme="light"
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      )}
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          placement="left"
          onClose={onClose}
          open={mobileOpen}
          styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}
          width={width}
          closable={false}
        >
          {renderLogo(false)}
          {menuContent}
        </Drawer>
      ) : (
        <Sider
          trigger={null}
          collapsible
          collapsed={isCollapsed}
          width={width}
          collapsedWidth={collapsedWidth}
          style={{ 
            background: '#fff', 
            borderRight: '1px solid #f0f0f0',
            position: 'sticky',
            top: 0,
            height: '100vh',
            left: 0
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {renderLogo(isCollapsed)}
            {menuContent}
          </div>
        </Sider>
      )}
    </>
  );
};
