import React, { useState, useCallback } from 'react';
import { Flex, Typography, Button, Tooltip } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import { TagSearchDialog } from './TagSearchDialog';

interface Props { axis?: 'x' | 'y'; limit?: number; }

export const DataPointSelector: React.FC<Props> = ({ axis = 'y', limit = 10 }) => {
  const { config, removeDataPoint, updateDataPointColor } = useWidgetConfigStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRemove = useCallback(
    (code: string) => removeDataPoint(code),
    [removeDataPoint],
  );

  const points = config.dataPoints.filter(dp => dp.axis ? dp.axis === axis : axis === 'y');

  return (
    <div>
      <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {points.length} tag{points.length !== 1 ? 's' : ''} selected
        </Typography.Text>
        <Button
          size="small"
          icon={<PlusOutlined />}
          onClick={() => setDialogOpen(true)}
          disabled={points.length >= limit}
        >
          Add Tag
        </Button>
      </Flex>

      {points.length === 0 && (
        <div
          style={{
            border: '2px dashed #d9d9d9',
            borderRadius: 8,
            padding: 24,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onClick={() => setDialogOpen(true)}
        >
          <PlusOutlined style={{ fontSize: 32, color: 'rgba(0,0,0,0.25)', marginBottom: 4 }} />
          <div style={{ color: 'rgba(0,0,0,0.25)', fontSize: 14 }}>
            Click to search & add data points
          </div>
        </div>
      )}

      <Flex vertical gap="small" style={{ marginTop: 8 }}>
        {points.map((dp) => (
          <Flex
            key={dp.code}
            align="center"
            gap="small"
            style={{
              padding: 8,
              borderRadius: 6,
              backgroundColor: '#fafafa',
              border: '1px solid #f0f0f0',
            }}
          >
            <Tooltip title="Click to change color">
              <input
                type="color"
                value={dp.color}
                onChange={(e) => updateDataPointColor(dp.code, e.target.value)}
                style={{
                  width: 24,
                  height: 24,
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            </Tooltip>

            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography.Text strong style={{ display: 'block' }} ellipsis>
                {dp.name || dp.code}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }} ellipsis>
                {dp.building} &middot; {dp.system} &middot; {dp.uom}
              </Typography.Text>
            </div>

            <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => handleRemove(dp.code)} />
          </Flex>
        ))}
      </Flex>

      <TagSearchDialog open={dialogOpen} onClose={() => setDialogOpen(false)} targetAxis={axis} />
    </div>
  );
};
