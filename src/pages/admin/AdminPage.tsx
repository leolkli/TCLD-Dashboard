import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import {
  People as UsersIcon,
  Widgets as TemplatesIcon,
  Functions as VtagIcon,
} from '@mui/icons-material';
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
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Administration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, templates, and system configuration
        </Typography>
      </Box>

      {/* Admin Cards */}
      <Grid container spacing={3}>
        {visibleCards.map((card) => (
          <Grid item xs={12} sm={6} lg={4} key={card.path}>
            <Card>
              <CardActionArea onClick={() => navigate(card.path)}>
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: `${card.color}15`,
                      }}
                    >
                      <card.icon sx={{ color: card.color, fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      {card.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
