import React, { useMemo } from 'react';
import { Flex, Radio, Select, Typography } from 'antd';
import {
  LineChartOutlined,
  BarChartOutlined,
  DotChartOutlined,
  AreaChartOutlined,
  PieChartOutlined,
  TableOutlined,
  NumberOutlined
} from '@ant-design/icons';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import type { WidgetChartType, DataRelationship } from '@/types/widget';

const relationships: { label: string; value: DataRelationship }[] = [
  { label: 'Single Metric / KPI', value: 'single-metric' },
  { label: 'Change over time', value: 'change-over-time' },
  { label: 'Comparing categories', value: 'comparing-categories' },
  { label: 'Part of a whole', value: 'part-of-whole' },
];

const allChartTypes: {
  label: string;
  value: WidgetChartType;
  icon: React.ReactNode;
  validFor: DataRelationship[];
}[] = [
  { label: 'KPI', value: 'kpi', icon: <NumberOutlined />, validFor: ['single-metric'] },
  { label: 'Line', value: 'line', icon: <LineChartOutlined />, validFor: ['change-over-time'] },
  { label: 'Area', value: 'area', icon: <AreaChartOutlined />, validFor: ['change-over-time'] },
  { label: 'Bar', value: 'bar', icon: <BarChartOutlined />, validFor: ['change-over-time', 'comparing-categories', 'part-of-whole'] },
  { label: 'Scatter', value: 'scatter', icon: <DotChartOutlined />, validFor: ['comparing-categories', 'correlation'] },
  { label: 'Pie', value: 'pie', icon: <PieChartOutlined />, validFor: ['part-of-whole'] },
  { label: 'Heatmap', value: 'heatmap', icon: <TableOutlined />, validFor: ['change-over-time', 'correlation'] },
];

export const ChartSettings: React.FC = () => {
  const { config, updateChart } = useWidgetConfigStore();
  const { chart } = config;

  const handleRelationshipChange = (newRel: DataRelationship) => {
    const firstValid = allChartTypes.find((ct) => ct.validFor.includes(newRel));
    updateChart({
      relationship: newRel,
      type: firstValid ? firstValid.value : 'bar',
    });
  };

  const validCharts = useMemo(
    () => allChartTypes.filter((ct) => ct.validFor.includes(chart.relationship || 'change-over-time')),
    [chart.relationship]
  );

  return (
    <Flex vertical gap="middle">
      <div style={{ width: '100%' }}>
        <Typography.Text type="secondary" style={{ marginBottom: 4, display: 'block', fontSize: 12 }}>
          What is the data relationship?
        </Typography.Text>
        <Select
          value={chart.relationship || 'change-over-time'}
          onChange={handleRelationshipChange}
          options={relationships}
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <Typography.Text type="secondary" style={{ marginBottom: 4, display: 'block', fontSize: 12 }}>
          Chart Type
        </Typography.Text>
        <Radio.Group
          value={chart.type}
          onChange={(e) => updateChart({ type: e.target.value })}
        >
          <Flex wrap="wrap" gap="small">
            {validCharts.map((ct) => (
              <Radio.Button key={ct.value} value={ct.value} style={{ borderRadius: 8 }}>
                {ct.icon} <span style={{ marginLeft: 4 }}>{ct.label}</span>
              </Radio.Button>
            ))}
          </Flex>
        </Radio.Group>
      </div>
    </Flex>
  );
};
