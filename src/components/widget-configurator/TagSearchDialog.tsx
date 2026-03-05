import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Checkbox,
  InputAdornment,
  CircularProgress,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import { synapseService } from '@/services/synapseService';
import type { SynapsePTag } from '@/types/synapse';
import type { SelectedDataPoint } from '@/types/widget';

interface TagSearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export const TagSearchDialog: React.FC<TagSearchDialogProps> = ({ open, onClose }) => {
  const { config, addDataPoint, filterOptions, fetchFilterOptions } = useWidgetConfigStore();

  const [query, setQuery] = useState('');
  const [building, setBuilding] = useState(config.buildingCode || '');
  const [system, setSystem] = useState('');
  const [commodity, setCommodity] = useState('');
  const [results, setResults] = useState<(SynapsePTag & { Building?: string })[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Sync building filter when dialog opens
  useEffect(() => {
    if (open) {
      setBuilding(config.buildingCode || '');
    }
  }, [open, config.buildingCode]);

  // Load filter options on mount
  useEffect(() => {
    if (open && filterOptions.buildings.length === 0) {
      fetchFilterOptions();
    }
  }, [open, filterOptions.buildings.length, fetchFilterOptions]);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      handleSearch();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, building, system, commodity, open]);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await synapseService.searchTags({
        q: query || undefined,
        building: building || undefined,
        system: system || undefined,
        commodity: commodity || undefined,
        limit: 50,
      });
      setResults(response.tags);
      setTotal(response.total);
    } catch {
      console.warn('Tag search failed, showing empty results');
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [query, building, system, commodity]);

  const toggleSelect = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleAdd = () => {
    results
      .filter((tag) => selected.has(tag.Code))
      .forEach((tag) => {
        const dp: SelectedDataPoint = {
          code: tag.Code,
          name: tag.Name,
          building: tag.Building || '',
          system: tag.System || '',
          uom: tag.UOM || '',
          commodity: tag.Commodity || '',
          color: '', // auto-assigned by store
          axisIndex: 0,
        };
        addDataPoint(dp);
      });
    setSelected(new Set());
    onClose();
  };

  const handleClose = () => {
    setSelected(new Set());
    setQuery('');
    onClose();
  };

  const existingCodes = new Set(config.dataPoints.map((dp) => dp.code));

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, maxHeight: '80vh' } }}
    >
      <DialogTitle
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}
      >
        <Typography variant="h6" fontWeight={600}>
          Search Tags
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {/* Search Bar */}
        <TextField
          placeholder="Search by name or code..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
          size="small"
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: loading ? (
              <InputAdornment position="end">
                <CircularProgress size={18} />
              </InputAdornment>
            ) : null,
          }}
          sx={{ mb: 1.5 }}
        />

        {/* Filter toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Button
            size="small"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? 'contained' : 'text'}
            color="primary"
          >
            Filters
          </Button>
          <Typography variant="caption" color="text.secondary">
            {total} tag{total !== 1 ? 's' : ''} found
          </Typography>
          {selected.size > 0 && (
            <Chip
              label={`${selected.size} selected`}
              size="small"
              color="primary"
              onDelete={() => setSelected(new Set())}
            />
          )}
        </Box>

        {/* Filters */}
        {showFilters && (
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <TextField
              select
              label="Building"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
              disabled={!!config.buildingCode}
              helperText={config.buildingCode ? 'Set by widget building' : undefined}
            >
              <MenuItem value="">All</MenuItem>
              {filterOptions.buildings.map((b) => (
                <MenuItem key={b} value={b}>
                  {b}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="System"
              value={system}
              onChange={(e) => setSystem(e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">All</MenuItem>
              {filterOptions.systems.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Commodity"
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">All</MenuItem>
              {filterOptions.commodities.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        )}

        {/* Results */}
        <List dense sx={{ maxHeight: 320, overflow: 'auto' }}>
          {results.map((tag) => {
            const alreadyAdded = existingCodes.has(tag.Code);
            const isSelected = selected.has(tag.Code);
            return (
              <ListItemButton
                key={tag.Code}
                onClick={() => !alreadyAdded && toggleSelect(tag.Code)}
                disabled={alreadyAdded}
                selected={isSelected}
                sx={{ borderRadius: 1.5, mb: 0.5 }}
              >
                <Checkbox
                  checked={isSelected || alreadyAdded}
                  disabled={alreadyAdded}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={500}>
                      {tag.Name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {tag.Building} &middot; {tag.System} &middot; {tag.UOM} &middot; {tag.Commodity}
                    </Typography>
                  }
                />
                {alreadyAdded && (
                  <Chip label="Added" size="small" variant="outlined" color="success" />
                )}
              </ListItemButton>
            );
          })}

          {!loading && results.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.disabled">
                {query || building || system || commodity
                  ? 'No tags match your search'
                  : 'Start typing to search tags'}
              </Typography>
            </Box>
          )}
        </List>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={selected.size === 0}
        >
          Add {selected.size > 0 ? `${selected.size} Tag${selected.size > 1 ? 's' : ''}` : 'Tags'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
