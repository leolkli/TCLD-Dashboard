import React, { useEffect, useState, useMemo } from 'react';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  FolderOpenOutlined,
  BankOutlined,
  TagsOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { synapseService } from '../../services/synapseService';
import type { SynapsePortfolio } from '../../types/synapse';
import type { Dashboard } from '../../types/dashboard';

type MenuItem = Required<MenuProps>['items'][number];

export const AntdSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [portfolios, setPortfolios] = useState<SynapsePortfolio[]>([]);
  const [buildingSubDashboards, setBuildingSubDashboards] = useState<Record<string, Dashboard[]>>({});

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const data = await synapseService.getHierarchy();
        setPortfolios(data);
      } catch (error) {
        console.error('Failed to load hierarchy', error);
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
    // When a building menu is expanded, trigger load of sub-dashboards
    keys.forEach(key => {
      if (key.startsWith('building-')) {
        const code = key.replace('building-', '');
        loadBuildingSubDashboards(code);
      }
    });
  };

  const menuItems: MenuItem[] = useMemo(() => {
    const overviewItem: MenuItem = {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Main Dashboard',
    };

    const portfolioItems: MenuItem = {
      key: 'portfolios',
      label: 'Portfolios & Buildings',
      type: 'group',
      children: portfolios.map((portfolio) => ({
        key: `portfolio-${portfolio.name}`,
        icon: <FolderOpenOutlined />,
        label: portfolio.name,
        children: portfolio.buildings?.map((building) => {
          const subs = buildingSubDashboards[building.code] || [];
          
          return {
            key: `building-${building.code}`,
            icon: <BankOutlined />,
            label: building.name || building.code,
            children: [
              {
                key: `/buildings/${building.code}/dashboard`,
                label: 'Main View',
              },
              ...subs.map(sub => ({
                key: `/buildings/${building.code}/dashboard/${sub.id}`,
                label: sub.name,
              }))
            ]
          };
        }),
      })),
    };

    const settingsItems: MenuItem = {
      key: 'settings',
      label: 'Administration',
      type: 'group',
      children: [
        {
          key: '/admin/vtags',
          icon: <TagsOutlined />,
          label: 'Vtag Management',
        },
        {
          key: '/admin/widget-configurator',
          icon: <SettingOutlined />,
          label: 'Widget Configurator',
        },
        {
          key: '/admin/templates',
          icon: <SettingOutlined />,
          label: 'Dashboard Configurator',
        }
      ]
    };

    return [overviewItem, { type: 'divider' }, portfolioItems, { type: 'divider' }, settingsItems];
  }, [portfolios, buildingSubDashboards]);

  // Derive selected keys based on location
  const selectedKeys = [location.pathname];
  
  // Find open keys so navigation doesn't collapse on route change (simplified logic)
  let defaultOpenKeys: string[] = [];
  if (location.pathname.includes('/buildings/')) {
    const match = location.pathname.match(/\/buildings\/([^\/]+)/);
    if (match) {
      defaultOpenKeys.push(`building-${match[1]}`);
      // find portfolio that owns this building
      const port = portfolios.find(p => p.buildings?.some(b => b.code === match[1]));
      if(port) defaultOpenKeys.push(`portfolio-${port.name}`);
    }
  }

  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKeys}
      defaultOpenKeys={defaultOpenKeys}
      style={{ height: '100%', borderRight: 0 }}
      items={menuItems}
      onClick={(e) => navigate(e.key)}
      onOpenChange={handleOpenChange}
    />
  );
};