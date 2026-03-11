import React from 'react';
import { Flex, Input, Typography, Switch, Radio } from 'antd';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import type { HeaderFontSize } from '@/types/widget';

const fontSizes: { label: string; value: HeaderFontSize }[] = [
  { label: 'S', value: 'small' },
  { label: 'M', value: 'medium' },
  { label: 'L', value: 'large' },
];

export const HeaderSettings: React.FC = () => {
  const { config, updateHeader, updateGeneral } = useWidgetConfigStore();
  const { header, general } = config;

  return (
    <Flex vertical gap="middle">
      <Input.TextArea
        placeholder="Description / Subtitle"
        value={general.description || ''}
        onChange={(e) => updateGeneral({ description: e.target.value })}
        rows={2}
      />

      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
        <Switch checked={header.visible} onChange={(v) => updateHeader({ visible: v })} />
        <strong style={{ marginLeft: 8 }}>Show Header Area</strong>
      </div>

      {header.visible && (
        <Flex vertical gap="small" style={{ paddingLeft: 8, borderLeft: '2px solid #1677ff' }}>
          <div>
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
              Title Typography Size
            </Typography.Text>
            <Radio.Group
              value={header.fontSize}
              onChange={(e) => updateHeader({ fontSize: e.target.value })}
            >
              {fontSizes.map((f) => (
                <Radio.Button key={f.value} value={f.value}>{f.label}</Radio.Button>
              ))}
            </Radio.Group>
          </div>

          <div>
            <Switch size="small" checked={header.showLastValue} onChange={(v) => updateHeader({ showLastValue: v })} />
            <span style={{ marginLeft: 8 }}>Display 'Last Value' Metric</span>
          </div>

          <div>
            <Switch size="small" checked={header.showChangePercent} onChange={(v) => updateHeader({ showChangePercent: v })} />
            <span style={{ marginLeft: 8 }}>Display 'Period Change %'</span>
          </div>
        </Flex>
      )}
    </Flex>
  );
};
