import React, { useState } from 'react';
import { Layout, Dropdown, Space, Avatar, Typography } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useMsal } from '@azure/msal-react';
import { Outlet } from 'react-router-dom';
import { AntdSidebar } from './AntdSidebar';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

export const AntdLayout: React.FC = () => {
  const { instance, accounts } = useMsal();
  const [collapsed, setCollapsed] = useState(false);

  const account = accounts[0];
  const name = account?.name || account?.username || 'User';

  const handleLogout = () => {
    instance.logoutRedirect().catch(console.error);
  };

  const userMenuProps = {
    items: [
      {
        key: 'profile',
        label: <Text strong>{name}</Text>,
        disabled: true,
      },
      {
        key: 'logout',
        label: 'Logout',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>TCLD Energy</div>
        <Dropdown menu={userMenuProps} trigger={['click']}>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
          </Space>
        </Dropdown>
      </Header>
      
      <Layout>
        <Sider 
          width={250} 
          theme="light" 
          collapsible 
          collapsed={collapsed} 
          onCollapse={(value) => setCollapsed(value)}
          style={{ borderRight: '1px solid #f0f0f0' }}
        >
          <AntdSidebar />
        </Sider>
        
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              background: '#fff',
              padding: 24,
              margin: 0,
              minHeight: 280,
              borderRadius: 8,
              border: '1px solid #f0f0f0'
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};
