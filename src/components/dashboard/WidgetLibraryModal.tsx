import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  TextField,
  Pagination,
  Box,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useDashboardGlobalStore } from '@/store/dashboardGlobalStore';
import { useDashboardStore } from '@/store/dashboardStore';

export const WidgetLibraryModal: React.FC = () => {
  const { isWidgetLibraryOpen, setWidgetLibraryOpen } = useDashboardGlobalStore();
  const { savedWidgets, addWidgetToDashboard, currentDashboard } = useDashboardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const handleClose = () => {
    setWidgetLibraryOpen(false);
    setSearchQuery('');
    setPage(1);
  };

  const handleAddWidget = (widgetId: string, widgetName: string) => {
    addWidgetToDashboard(widgetId, widgetName);
  };

  const filteredWidgets = useMemo(() => {
    let filtered = savedWidgets;

    // 1. Filter by building/portfolio based on current dashboard
    if (currentDashboard) {
      if (currentDashboard.scope === 'portfolio-main') {
        filtered = filtered.filter(w => w.widgetScope === 'portfolio' && w.portfolioName === currentDashboard.portfolioName);
      } else {
        filtered = filtered.filter(w => w.widgetScope === 'building' && w.buildingCode === currentDashboard.buildingCode);
      }
    }

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(w => w.name.toLowerCase().includes(lowerQuery));
    }

    return filtered;
  }, [savedWidgets, currentDashboard, searchQuery]);

  const pageCount = Math.ceil(filteredWidgets.length / itemsPerPage);
  const paginatedWidgets = filteredWidgets.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Dialog open={isWidgetLibraryOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Widget Library</DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: '400px' }}>
        <TextField
          placeholder="Search by widget name..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {filteredWidgets.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            No saved widgets found.
          </Typography>
        ) : (
          <>
            <List sx={{ flex: 1 }}>
              {paginatedWidgets.map((widget) => (
                <ListItem key={widget.id} divider>
                  <ListItemText
                    primary={widget.name}
                    secondary={`${widget.chart.type.toUpperCase()} • ${widget.dataPoints.length} Metrics`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      color="primary"
                      onClick={() => handleAddWidget(widget.id!, widget.name)}
                      aria-label="add"
                    >
                      <AddIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            
            {pageCount > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination 
                  count={pageCount} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                />
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
};
