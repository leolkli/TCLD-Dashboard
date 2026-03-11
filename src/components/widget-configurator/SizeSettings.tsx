import React from 'react';
import { Flex, Switch, Input, Slider, Typography } from 'antd';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';

export const SizeSettings: React.FC = () => {
  const { config, updateSize } = useWidgetConfigStore();
  const { size } = config;

  return (
    <Flex vertical gap="middle">
      <div>
        <Switch checked={size.useContainerSize} onChange={(v) => updateSize({ useContainerSize: v })} />
        <span style={{ marginLeft: 8 }}>Auto-fit container</span>
      </div>

      {!size.useContainerSize && (
        <Flex vertical gap="small">
          <Input
            placeholder="Width (e.g. 100%, 600px)"
            value={size.width}
            onChange={(e) => updateSize({ width: e.target.value })}
            addonBefore="Width"
          />
          <Input
            placeholder="Height (e.g. 100%, 400px)"
            value={size.height}
            onChange={(e) => updateSize({ height: e.target.value })}
            addonBefore="Height"
          />
        </Flex>
      )}

      <div>
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
          Grid Column Span (2-12)
        </Typography.Text>
        <Slider
          value={size.gridColSpan ?? 6}
          onChange={(val) => updateSize({ gridColSpan: val })}
          min={2}
          max={12}
          step={1}
          marks={{ 2: '2', 6: '6', 12: '12' }}
        />
      </div>
    </Flex>
  );
};
