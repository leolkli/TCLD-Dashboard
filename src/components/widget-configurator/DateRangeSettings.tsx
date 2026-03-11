import React from 'react';
import { Typography, Radio, Flex } from 'antd';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import type { AggregationInterval } from '@/types/widget';

const aggregations: { label: string; value: AggregationInterval }[] = [
  { label: 'Raw', value: 'raw' },
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' },
  { label: 'Monthly', value: 'monthly' },
];

export const DateRangeSettings: React.FC = () => {
  const { config, updateDateRange } = useWidgetConfigStore();
  const { dateRange } = config;

  return (
    <div>
      <Typography.Text type="secondary" style={{ marginBottom: 4, display: 'block', fontSize: 12 }}>
        Aggregation
      </Typography.Text>
      <Radio.Group
        value={dateRange.aggregation}
        onChange={(e) => updateDateRange({ aggregation: e.target.value })}
      >
        <Flex wrap="wrap" gap="small">
          {aggregations.map((a) => (
            <Radio.Button key={a.value} value={a.value} style={{ borderRadius: 8 }}>
              {a.label}
            </Radio.Button>
          ))}
        </Flex>
      </Radio.Group>
    </div>
  );
};
