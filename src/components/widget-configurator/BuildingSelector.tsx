import React, { useEffect, useState } from 'react';
import {
  Autocomplete,
  TextField,
  Stack,
  Typography,
  Chip,
  Box,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Business as BusinessIcon,
  AccountTree as PortfolioIcon,
} from '@mui/icons-material';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import { synapseService } from '@/services/synapseService';
import type { BuildingListItem, WidgetScope } from '@/types/widget';

interface PortfolioOption {
  name: string;
}

export const BuildingSelector: React.FC = () => {
  const { config, buildings, setBuilding, setPortfolio, fetchBuildings } =
    useWidgetConfigStore();

  const [portfolios, setPortfolios] = useState<PortfolioOption[]>([]);

  useEffect(() => {
    if (buildings.length === 0) {
      fetchBuildings();
    }
  }, [buildings.length, fetchBuildings]);

  // Fetch portfolios for portfolio-scope widgets
  useEffect(() => {
    const loadPortfolios = async () => {
      try {
        const hierarchy = await synapseService.getHierarchy();
        setPortfolios(hierarchy.map((p) => ({ name: p.name })));
      } catch {
        setPortfolios([]);
      }
    };
    loadPortfolios();
  }, []);

  const scope: WidgetScope = config.widgetScope || 'building';

  const selectedBuilding =
    buildings.find((b) => b.code === config.buildingCode) ?? null;

  const selectedPortfolio =
    portfolios.find((p) => p.name === config.portfolioName) ?? null;

  const handleScopeChange = (_: unknown, value: WidgetScope | null) => {
    if (!value) return;
    if (value === 'building') {
      setBuilding('', '');
    } else {
      setPortfolio('');
    }
  };

  const handleBuildingChange = (_: unknown, value: BuildingListItem | null) => {
    if (value) {
      setBuilding(value.code, value.name);
    } else {
      setBuilding('', '');
    }
  };

  const handlePortfolioChange = (_: unknown, value: PortfolioOption | null) => {
    setPortfolio(value?.name || '');
  };

  return (
    <Stack spacing={2}>
      {/* Scope Toggle */}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          Widget Scope
        </Typography>
        <ToggleButtonGroup
          value={scope}
          exclusive
          onChange={handleScopeChange}
          size="small"
          fullWidth
        >
          <ToggleButton value="building">
            <BusinessIcon sx={{ mr: 0.5, fontSize: 16 }} /> Building
          </ToggleButton>
          <ToggleButton value="portfolio">
            <PortfolioIcon sx={{ mr: 0.5, fontSize: 16 }} /> Portfolio
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Building Selector */}
      {scope === 'building' && (
        <>
          <Autocomplete
            options={buildings}
            value={selectedBuilding}
            onChange={handleBuildingChange}
            getOptionLabel={(opt) => `${opt.name} (${opt.code})`}
            isOptionEqualToValue={(opt, val) => opt.code === val.code}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Building"
                placeholder="Search buildings…"
                size="small"
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.code}>
                <BusinessIcon
                  sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }}
                />
                <Box>
                  <Typography variant="body2">{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.code}
                  </Typography>
                </Box>
              </Box>
            )}
            fullWidth
            size="small"
          />

          {config.buildingCode && (
            <Chip
              icon={<BusinessIcon />}
              label={`${config.buildingName} — ${config.buildingCode}`}
              color="primary"
              variant="outlined"
              size="small"
              onDelete={() => setBuilding('', '')}
            />
          )}

          {!config.buildingCode && (
            <Typography variant="caption" color="text.secondary">
              Select a building to scope tag search and attach this widget.
            </Typography>
          )}
        </>
      )}

      {/* Portfolio Selector */}
      {scope === 'portfolio' && (
        <>
          <Autocomplete
            options={portfolios}
            value={selectedPortfolio}
            onChange={handlePortfolioChange}
            getOptionLabel={(opt) => opt.name}
            isOptionEqualToValue={(opt, val) => opt.name === val.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Portfolio"
                placeholder="Search portfolios…"
                size="small"
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.name}>
                <PortfolioIcon
                  sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }}
                />
                <Typography variant="body2">{option.name}</Typography>
              </Box>
            )}
            fullWidth
            size="small"
          />

          {config.portfolioName && (
            <Chip
              icon={<PortfolioIcon />}
              label={config.portfolioName}
              color="secondary"
              variant="outlined"
              size="small"
              onDelete={() => setPortfolio('')}
            />
          )}

          {!config.portfolioName && (
            <Typography variant="caption" color="text.secondary">
              Select a portfolio. Tags from all buildings in the portfolio will be available.
            </Typography>
          )}
        </>
      )}
    </Stack>
  );
};
