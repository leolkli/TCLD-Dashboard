import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Flex } from 'antd';
import {
  TeamOutlined as UsersIcon,
  AppstoreOutlined as TemplatesIcon,
  FunctionOutlined as VtagIcon,
} from '@ant-design/icons';
import { useAuthStore } from '@store/authStore';

const adminCards = [
  {
    title: 'User Management',
    description: 'Manage users, roles, and building access permissions',
    icon: UsersIcon,
    path: '/admin/users',
    roles: ['super_admin'],
    color: '#667eea',
  },
  {
    title: 'Dashboard Templates',
    description: 'Create and manage dashboard page templates',
    icon: TemplatesIcon,
    path: '/admin/templates',
    roles: ['super_admin', 'building_admin'],
    color: '#10b981',
  },
  {
    title: 'Virtual Tags (Vtags)',
    description: 'Define calculated metrics and formulas',
    icon: VtagIcon,
    path: '/admin/vtags',
    roles: ['super_admin', 'building_admin'],
    color: '#f59e0b',
  },
];

const { Title, Text } = Typography;

/**
 * Admin Page Component
 * Landing page for administration features
 */
export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasAnyRole } = useAuthStore();

  const visibleCards = adminCards.filter((card) =>
    hasAnyRole(card.roles as never[])
  );

  return (
    <div style={{ width: '100%', padding: '24px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
          Administration
        </Title>
        <Text type="secondary">
          Manage users, templates, and system configuration
        </Text>
      </div>

      {/* Admin Cards */}
      <Row gutter={[24, 24]}>
        {visibleCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Col xs={24} sm={12} lg={8} key={card.path}>
              <Card
                hoverable
                onClick={() => navigate(card.path)}
                style={{ height: '100%', cursor: 'pointer' }}
              >
                <Flex vertical style={{ width: '100%' }} gap={16}>
                  <Flex align="center" gap={16}>
                    <div
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: `${card.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent
                        style={{ color: card.color, fontSize: 32 }}
                      />
                    </div>
                    <Title level={5} style={{ margin: 0 }}>
                      {card.title}
                    </Title>
                  </Flex>
                  <Text type="secondary">{card.description}</Text>
                </Flex>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};
