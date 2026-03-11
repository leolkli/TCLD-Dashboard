import { useNavigate } from 'react-router-dom';
import { Button, Typography, Flex } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

/**
 * 404 Not Found Page
 */
export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Flex
      justify="center"
      align="center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      }}
    >
      <Flex
        vertical
        align="center"
        gap="large"
        style={{
          textAlign: 'center',
          maxWidth: '500px',
          padding: '24px',
        }}
      >
        <Title
          level={1}
          style={{
            fontSize: '128px',
            fontWeight: 700,
            margin: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </Title>

        <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
          Page Not Found
        </Title>

        <Paragraph type="secondary" style={{ margin: 0 }}>
          The page you're looking for doesn't exist or has been moved.
        </Paragraph>

        <Button
          type="primary"
          size="large"
          icon={<HomeOutlined />}
          onClick={() => navigate('/')}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderColor: 'transparent',
            paddingLeft: '32px',
            paddingRight: '32px',
          }}
        >
          Go to Dashboard
        </Button>
      </Flex>
    </Flex>
  );
};
