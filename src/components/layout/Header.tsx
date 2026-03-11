import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout, Avatar, Badge, Dropdown, Button, Space, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
  BankOutlined,
  FunctionOutlined,
  AppstoreOutlined,
  TeamOutlined,
  LineChartOutlined
} from '@ant-design/icons';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.displayName || 'User';
  const email = user?.email || '';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
  };

  const settingsMenuItems: MenuProps['items'] = [
    {
      key: 'ptag',
      icon: <BankOutlined />,
      label: 'Ptag',
      onClick: () => handleNavigation('/buildings'),
    },
    {
      key: 'vtag',
      icon: <FunctionOutlined />,
      label: 'Vtag',
      onClick: () => handleNavigation('/admin/vtags'),
    },
    {
      key: 'dashboard-config',
      icon: <AppstoreOutlined />,
      label: 'Dashboard Configuration',
      onClick: () => handleNavigation('/admin/templates'),
    },
    {
      key: 'widget-config',
      icon: <LineChartOutlined />,
      label: 'Widget Configurator',
      onClick: () => handleNavigation('/admin/widget-configurator'),
    },
    {
      type: 'divider',
    },
    {
      key: 'user-management',
      icon: <TeamOutlined />,
      label: 'User Management',
      onClick: () => handleNavigation('/admin/users'),
    }
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 0', minWidth: 150 }}>
          <div style={{ fontWeight: 600 }}>{displayName}</div>
          <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: '12px' }}>{email}</div>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader style={{ 
      background: '#fff', 
      padding: '0 16px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1,
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button 
          type="text" 
          icon={<MenuOutlined />} 
          onClick={onToggleSidebar} 
          style={{ fontSize: '16px', width: 64, height: 64, marginLeft: '-16px' }}
        />
      </div>

      <Space size="middle" style={{ display: 'flex', alignItems: 'center' }}>
        <Dropdown menu={{ items: settingsMenuItems }} trigger={['click']} placement="bottomRight">
          <Tooltip title="Settings">
            <Button type="text" icon={<SettingOutlined style={{ fontSize: '16px', color: 'rgba(0,0,0,0.45)' }} />} />
          </Tooltip>
        </Dropdown>

        <Tooltip title="Notifications">
          <Badge count={3} offset={[-4, 4]}>
            <Button type="text" icon={<BellOutlined style={{ fontSize: '16px', color: 'rgba(0,0,0,0.45)' }} />} />
          </Badge>
        </Tooltip>

        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <Tooltip title="User Menu">
            <Avatar style={{ backgroundColor: '#1890ff', verticalAlign: 'middle', cursor: 'pointer' }}>
              {initials}
            </Avatar>
          </Tooltip>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};
