import React from 'react';
import { Box, Card, Typography, Skeleton, IconButton, Menu, MenuItem, Tooltip, Stack } from '@mui/material';
import { ErrorOutline, MoreVert, Refresh, Fullscreen, OpenInNew } from '@mui/icons-material';
import type { WidgetConfiguration } from '@/types/widget';

export interface WidgetContainerProps {
  config: WidgetConfiguration;
  isLoading: boolean;
  error: Error | null;
  onRefresh?: () => void;
  onEdit?: () => void;
  onExpand?: () => void;
  onExport?: () => void;
  onRemove?: () => void;
  children: React.ReactNode;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  config,
  isLoading,
  error,
  onRefresh,
  onEdit,
  onExpand,
  onExport,
  onRemove,
  children
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuActions = [
    { label: 'Refresh Data', icon: <Refresh fontSize="small" />, action: onRefresh },
    { label: 'Edit Widget', icon: <OpenInNew fontSize="small" />, action: onEdit },
    { label: 'Export Data', icon: undefined, action: onExport },
    { label: 'Remove Widget', icon: undefined, action: onRemove, color: 'error.main' },
  ].filter(item => item.action);

  return (
    <Card 
      sx={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        boxShadow: 2,
        borderRadius: 2,
      }}
    >
      {/* Title Bar - draggable handle area */}
      <Box 
        className="widget-header"
        sx={{ 
          px: 2, 
          py: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' }
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} overflow="hidden">
          <Typography variant="subtitle2" component="div" noWrap title={config.name}>
            {config.header.visible ? config.name : ''}
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          {onExpand && (
            <Tooltip title="Expand">
              <IconButton size="small" onClick={onExpand}>
                <Fullscreen fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {menuActions.length > 0 && (
            <>
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVert fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {menuActions.map((item, index) => (
                  <MenuItem 
                    key={index} 
                    onClick={() => { item.action?.(); handleMenuClose(); }}
                    sx={{ color: item.color, fontSize: '0.875rem' }}
                  >
                    {item.icon && <Box component="span" sx={{ mr: 1, display: 'flex' }}>{item.icon}</Box>}
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Stack>
      </Box>

      {/* Content Area */}
      <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden', bgcolor: config.chart?.backgroundColor || 'background.paper' }}>
        {error ? (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'error.main' }}>
            <ErrorOutline sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2" textAlign="center">{error.message || 'Failed to load data'}</Typography>
            {onRefresh && (
              <IconButton onClick={onRefresh} sx={{ mt: 2 }} color="inherit">
                <Refresh />
              </IconButton>
            )}
          </Box>
        ) : isLoading ? (
          <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="rectangular" width="100%" height="100%" sx={{ mt: 1, borderRadius: 1 }} />
          </Box>
        ) : (
          <Box sx={{ height: '100%', width: '100%', p: 1 }}>
            {children}
          </Box>
        )}
      </Box>
    </Card>
  );
};
