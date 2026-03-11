import React from 'react';
import { Typography, Flex, Spin } from 'antd';
import { FallOutlined, RiseOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

const { Text, Title } = Typography;

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
    const defaultColor = '#8c8c8c'; // text secondary
    if (!trend || trend.direction === 'flat') return { icon: <ArrowRightOutlined />, color: defaultColor, bgcolor: 'transparent' };
    
    const isGood = trend.isPositiveGood ?? true;
    const isUp = trend.direction === 'up';
    // If it's up and up is good -> success. If it's down and up is good -> error.
    const isSuccess = isUp ? isGood : !isGood;
    
    const tokenSuccess = '#52c41a';
    const tokenError = '#ff4d4f';

    const visualColor = isSuccess ? tokenSuccess : tokenError;

    return {
      icon: isUp ? <RiseOutlined /> : <FallOutlined />,
      color: visualColor,
      bgcolor: isSuccess ? `${tokenSuccess}15` : `${tokenError}15`
    };
  };

  const trendVisuals = getTrendVisuals();
  const primaryColor = color || '#1677ff'; // primary main in antd

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ height: '100%', padding: 16 }}>
        <Spin size="default" />
      </Flex>
    );
  }

  return (
    <Flex vertical justify="center" style={{ padding: 16, height: '100%' }}>
      <Text type="secondary" strong style={{ textTransform: 'uppercase', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {title}
      </Text>
      
      <Flex align="baseline" wrap="wrap" gap={8}>
        <Title level={3} style={{ margin: 0, lineHeight: 1 }}>
          {formatValue(value)}
        </Title>
        
        {trend && (
          <Flex align="center" gap={4}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                color: trendVisuals.color,
                backgroundColor: trendVisuals.bgcolor,
                padding: '2px 4px',
                borderRadius: 4,
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {trendVisuals.icon}
              <span style={{ marginLeft: 4 }}>
                {trend.value.toFixed(1)}%
              </span>
            </div>
            {trend.label && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {trend.label}
              </Text>
            )}
          </Flex>
        )}
      </Flex>

      {sparklineData && sparklineData.length > 0 && (
        <div style={{ flexGrow: 1, marginTop: 16, minHeight: 60, width: '100%' }}>
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
        </div>
      )}
    </Flex>
  );
};
