import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, Typography, Flex, Divider } from 'antd';
import { LoginOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

/**
 * Login Page Component
 * Microsoft Entra ID SSO login
 */
export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();

  const handleLogin = () => {
    login();
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Flex
      justify="center"
      align="center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '500px',
        }}
      >
        <Flex vertical gap="large" align="center" style={{ padding: '48px 24px' }}>
          {/* Logo / Title */}
          <Flex vertical align="center" gap="small">
            <Title
              level={2}
              style={{
                margin: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              TCLD Energy Management
            </Title>
            <Paragraph type="secondary" style={{ margin: 0 }}>
              Building Energy Analytics Dashboard
            </Paragraph>
          </Flex>

          <Divider style={{ margin: '8px 0' }} />

          {/* Description */}
          <Paragraph
            type="secondary"
            style={{
              textAlign: 'center',
              maxWidth: '360px',
              margin: 0,
            }}
          >
            Sign in with your organization account to access real-time energy
            insights and analytics for your buildings.
          </Paragraph>

          {/* Login Button */}
          <Button
            type="primary"
            size="large"
            icon={<LoginOutlined />}
            onClick={handleLogin}
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderColor: 'transparent',
              width: '100%',
              maxWidth: '300px',
            }}
          >
            Sign in with Microsoft
          </Button>

          {/* Footer */}
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Protected by Microsoft Entra ID
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
};
