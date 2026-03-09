import React from 'react';
import { Box, Typography, Stack, useTheme, CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

// Use recharts for tiny inline sparklines without heavy echarts overhead
// We'll need to install it if not present, but recharts is perfect for small KPI lines

interface KPIWidgetProps {
  title: string;
  value: number | string;
  previousValue?: number | string;
  format?: 'number' | 'currency' | 'percent' | 'compact';
  trend?: {
    value: number; // percentage change
    direction?: 'up' | 'down' | 'flat'; // calculated if not provided
    label?: string; // e.g. "vs last month"
    isPositiveGood?: boolean; // false if going down is good (e.g. bounce rate)
  };
  sparklineData?: Array<{ date: string; value: number }>;
  color?: string;
  loading?: boolean;
}

export const KPIWidget: React.FC<KPIWidgetProps> = ({
  title,
  value,
  previousValue,
  format = 'number',
  trend: providedTrend,
  sparklineData,
  color,
  loading = false
}) => {
  const theme = useTheme();

  // Value formatting
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    switch (format) {
      case 'currency': return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
      case 'percent': return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1 }).format(val / 100);
      case 'compact': return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(val);
      default: return new Intl.NumberFormat('en-US').format(val);
    }
  };

  // Trend calculation
  const calculateTrend = () => {
    if (providedTrend) return providedTrend;
    if (typeof value === 'number' && typeof previousValue === 'number' && previousValue !== 0) {
      const pctChange = ((value - previousValue) / previousValue) * 100;
      return {
        value: Math.abs(pctChange),
        direction: pctChange > 0 ? 'up' : pctChange < 0 ? 'down' : 'flat',
        isPositiveGood: true,
        label: undefined
      };
    }
    return null;
  };

  const trend = calculateTrend();
  
  // Trend styling
  const getTrendVisuals = () => {
    if (!trend || trend.direction === 'flat') return { icon: <TrendingFlatIcon fontSize="small" />, color: theme.palette.text.secondary };
    
    const isGood = trend.isPositiveGood ?? true;
    const isUp = trend.direction === 'up';
    // If it's up and up is good -> success. If it's down and up is good -> error.
    const isSuccess = isUp ? isGood : !isGood;
    
    return {
      icon: isUp ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />,
      color: isSuccess ? theme.palette.success.main : theme.palette.error.main,
      bgcolor: isSuccess ? `${theme.palette.success.main}15` : `${theme.palette.error.main}15`
    };
  };

  const trendVisuals = getTrendVisuals();
  const primaryColor = color || theme.palette.primary.main;

  if (loading) {
    return (
      <Box sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Typography variant="overline" color="text.secondary" fontWeight={600} noWrap>
        {title}
      </Typography>
      
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h3" component="div" fontWeight={700} sx={{ lineHeight: 1 }}>
          {formatValue(value)}
        </Typography>
        
        {trend && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: trendVisuals.color,
                bgcolor: trendVisuals.bgcolor,
                px: 0.5,
                py: 0.25,
                borderRadius: 1,
                Typography: 'body2',
                fontWeight: 'bold'
              }}
            >
              {trendVisuals.icon}
              <Typography variant="body2" component="span" fontWeight="bold" sx={{ ml: 0.5 }}>
                {trend.value.toFixed(1)}%
              </Typography>
            </Box>
            {trend.label && (
              <Typography variant="caption" color="text.secondary">
                {trend.label}
              </Typography>
            )}
          </Stack>
        )}
      </Box>

      {sparklineData && sparklineData.length > 0 && (
        <Box sx={{ flexGrow: 1, mt: 2, minHeight: 60, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={primaryColor} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#gradient-${title.replace(/\s+/g, '-')})`} 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};
