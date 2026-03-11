import React from 'react';
import { Flex, Select, Typography, Slider, Switch, Radio } from 'antd';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import type { BarLayout, PieLayout } from '@/types/widget';

const refreshOptions = [
  { label: 'Disabled', value: 0 },
  { label: '10 seconds', value: 10 },
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '15 minutes', value: 900 },
];

export const GeneralSettings: React.FC = () => {
  const { config, updateGeneral, updateChart } = useWidgetConfigStore();
  const { general, chart } = config;

  return (
    <Flex vertical gap="large">
      <div>
        <Typography.Title level={5} style={{ color: '#1677ff', borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginTop: 0 }}>
          Data Freshness
        </Typography.Title>
        <Select
          style={{ width: '100%' }}
          value={general.refreshInterval}
          onChange={(val) => updateGeneral({ refreshInterval: val })}
          options={refreshOptions}
        />
      </div>

      <div>
        <Typography.Title level={5} style={{ color: '#1677ff', borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginTop: 0 }}>
          Chart Specific Styling
        </Typography.Title>
        
        {(chart.type === 'line' || chart.type === 'area') && (
          <div style={{ marginBottom: 16 }}>
            <Typography.Text type="secondary">Line Width: {chart.lineWidth}px</Typography.Text>
            <Slider
              value={chart.lineWidth}
              onChange={(val) => updateChart({ lineWidth: val })}
              min={1}
              max={5}
              step={0.5}
            />
          </div>
        )}

        {chart.type === 'area' && (
          <div style={{ marginBottom: 16 }}>
            <Typography.Text type="secondary">Fill Opacity: {chart.fillOpacity}%</Typography.Text>
            <Slider
              value={chart.fillOpacity}
              onChange={(val) => updateChart({ fillOpacity: val })}
              min={0}
              max={100}
            />
          </div>
        )}

        {chart.type === 'bar' && (
          <div style={{ marginBottom: 16 }}>
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Bar Layout</Typography.Text>
            <Radio.Group
              value={chart.barLayout || 'grouped'}
              onChange={(e) => updateChart({ barLayout: e.target.value as BarLayout })}
              buttonStyle="solid"
            >
              <Radio.Button value="grouped">Grouped</Radio.Button>
              <Radio.Button value="stacked">Stacked</Radio.Button>
              <Radio.Button value="horizontal">Horizontal</Radio.Button>
            </Radio.Group>
          </div>
        )}

        {chart.type === 'pie' && (
          <div style={{ marginBottom: 16 }}>
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Pie Style</Typography.Text>
            <Radio.Group
              value={chart.pieLayout || 'standard'}
              onChange={(e) => updateChart({ pieLayout: e.target.value as PieLayout })}
              buttonStyle="solid"
            >
              <Radio.Button value="standard">Standard</Radio.Button>
              <Radio.Button value="donut">Donut</Radio.Button>
            </Radio.Group>
          </div>
        )}

        {chart.type === 'scatter' && (
          <Flex vertical gap="middle" style={{ marginBottom: 16 }}>
            <div>
              <Typography.Text type="secondary">Min Point Size: {chart.scatterPointMinSize || 4}px</Typography.Text>
              <Slider
                value={chart.scatterPointMinSize || 4}
                onChange={(val) => updateChart({ scatterPointMinSize: val })}
                min={2}
                max={20}
              />
            </div>
            <div>
              <Typography.Text type="secondary">Max Point Size: {chart.scatterPointMaxSize || 20}px</Typography.Text>
              <Slider
                value={chart.scatterPointMaxSize || 20}
                onChange={(val) => updateChart({ scatterPointMaxSize: val })}
                min={10}
                max={50}
              />
            </div>
            <div>
              <Switch checked={!!chart.showTrendline} onChange={(val) => updateChart({ showTrendline: val })} />
              <span style={{ marginLeft: 8 }}>Show Trendline</span>
            </div>
          </Flex>
        )}
      </div>

      <div>
        <Typography.Title level={5} style={{ color: '#1677ff', borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginTop: 0 }}>
          Universal Visuals
        </Typography.Title>
        <Flex vertical gap="small">
          <div>
            <Switch checked={chart.showGridLines} onChange={(val) => updateChart({ showGridLines: val })} />
            <span style={{ marginLeft: 8 }}>Show Grid Lines</span>
          </div>
          <div>
            <Switch checked={!!chart.showDataLabels} onChange={(val) => updateChart({ showDataLabels: val })} />
            <span style={{ marginLeft: 8 }}>Show Data Labels</span>
          </div>
        </Flex>
      </div>
    </Flex>
  );
};
