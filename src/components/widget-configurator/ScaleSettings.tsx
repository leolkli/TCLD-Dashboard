import React from 'react';
import { Flex, Switch, Radio, Typography, InputNumber, Slider } from 'antd';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import type { ScaleType } from '@/types/widget';

export const ScaleSettings: React.FC = () => {
  const { config, updateScales } = useWidgetConfigStore();
  const { scales } = config;

  return (
    <Flex vertical gap="middle">
      <div>
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
          Scale Type
        </Typography.Text>
        <Radio.Group
          value={scales.scaleType}
          onChange={(e) => updateScales({ scaleType: e.target.value as ScaleType })}
        >
          <Radio.Button value="linear">Linear</Radio.Button>
          <Radio.Button value="log">Logarithmic</Radio.Button>
        </Radio.Group>
      </div>

      <div>
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
          Y-Axis Range
        </Typography.Text>
        <Radio.Group
          value={scales.yAxisMode}
          onChange={(e) => updateScales({ yAxisMode: e.target.value })}
        >
          <Radio.Button value="auto">Auto</Radio.Button>
          <Radio.Button value="manual">Manual</Radio.Button>
        </Radio.Group>
      </div>

      {scales.yAxisMode === 'manual' && (
        <Flex gap="small">
          <InputNumber
            placeholder="Y Min"
            value={scales.yMin}
            onChange={(val) => updateScales({ yMin: val !== null ? Number(val) : undefined })}
            style={{ width: '100%' }}
          />
          <InputNumber
            placeholder="Y Max"
            value={scales.yMax}
            onChange={(val) => updateScales({ yMax: val !== null ? Number(val) : undefined })}
            style={{ width: '100%' }}
          />
        </Flex>
      )}

      {config.chart.type === 'scatter' && (
        <>
          <div>
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
              X-Axis Range (Scatter Plot)
            </Typography.Text>
            <Radio.Group
              value={scales.xAxisMode}
              onChange={(e) => updateScales({ xAxisMode: e.target.value })}
            >
              <Radio.Button value="auto">Auto</Radio.Button>
              <Radio.Button value="manual">Manual</Radio.Button>
            </Radio.Group>
          </div>

          {scales.xAxisMode === 'manual' && (
            <Flex gap="small">
              <InputNumber
                placeholder="X Min"
                value={scales.xMin}
                onChange={(val) => updateScales({ xMin: val !== null ? Number(val) : undefined })}
                style={{ width: '100%' }}
              />
              <InputNumber
                placeholder="X Max"
                value={scales.xMax}
                onChange={(val) => updateScales({ xMax: val !== null ? Number(val) : undefined })}
                style={{ width: '100%' }}
              />
            </Flex>
          )}
        </>
      )}

      <div>
        <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
          Decimal Precision: {scales.precision}
        </Typography.Text>
        <Slider
          value={scales.precision}
          onChange={(val) => updateScales({ precision: val })}
          min={0}
          max={6}
          step={1}
          marks={{ 0: '0', 2: '2', 4: '4', 6: '6' }}
        />
      </div>

      <div>
        <Switch checked={scales.showPriceScale} onChange={(v) => updateScales({ showPriceScale: v })} />
        <span style={{ marginLeft: 8 }}>Show Y-Axis Labels</span>
      </div>
    </Flex>
  );
};
