import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Box, Button, Card, CardContent, Typography, Container, Stack } from '@mui/material';
import { Microsoft as MicrosoftIcon } from '@mui/icons-material';

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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          <CardContent sx={{ p: 6 }}>
            <Stack spacing={4} alignItems="center">
              {/* Logo / Title */}
              <Box textAlign="center">
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  TCLD Energy Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Building Energy Analytics Dashboard
                </Typography>
              </Box>

              {/* Description */}
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ maxWidth: 360 }}
              >
                Sign in with your organization account to access real-time energy
                insights and analytics for your buildings.
              </Typography>

              {/* Login Button */}
              <Button
                variant="contained"
                size="large"
                startIcon={<MicrosoftIcon />}
                onClick={handleLogin}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                  },
                }}
              >
                Sign in with Microsoft
              </Button>

              {/* Footer */}
              <Typography variant="caption" color="text.secondary">
                Protected by Microsoft Entra ID
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
