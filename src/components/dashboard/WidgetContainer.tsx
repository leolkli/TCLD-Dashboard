import React from 'react';
import { Card, Typography, Skeleton, Dropdown, MenuProps, Tooltip, Button, Flex } from 'antd';
import { 
  ExclamationCircleOutlined, 
  MoreOutlined, 
  SyncOutlined, 
  FullscreenOutlined, 
  EditOutlined, 
} from '@ant-design/icons';
import type { WidgetConfiguration } from '@/types/widget';

const { Text } = Typography;

export interface WidgetContainerProps {
  config: WidgetConfiguration;
  isLoading: boolean;
  error: Error | null;
  onRefresh?: () => void;
  onEdit?: () => void;
  onExpand?: () => void;
  onExport?: () => void;
  onRemove?: () => void;
  children: React.ReactNode;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  config,
  isLoading,
  error,
  onRefresh,
  onEdit,
  onExpand,
  onExport,
  onRemove,
  children
}) => {

  const menuItems: MenuProps['items'] = [
    ...(onRefresh ? [{ key: 'refresh', label: 'Refresh Data', icon: <SyncOutlined />, onClick: onRefresh }] : []),
      ...(onEdit ? [{ key: 'edit', label: 'Edit Widget', icon: <EditOutlined />, onClick: onEdit }] : []),
    ...(onExport ? [{ key: 'export', label: 'Export Data', onClick: onExport }] : []),
    ...(onRemove ? [{ key: 'remove', label: 'Remove Widget', danger: true, onClick: onRemove }] : []),
  ];

  return (
    <Card 
      styles={{
        body: { padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }
      }}
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        borderRadius: 8,
      }}
    >
      {/* Title Bar - draggable handle area */}
      <Flex 
        className="widget-header"
        align="center" 
        justify="space-between"
        style={{ 
          padding: '8px 16px', 
          borderBottom: '1px solid var(--ant-color-border-secondary)',
          backgroundColor: 'var(--ant-color-bg-container)',
          cursor: 'grab',
        }}
      >
        <Flex align="center" gap={8} style={{ overflow: 'hidden' }}>
          <Text strong ellipsis title={config.name} style={{ margin: 0, fontSize: '14px' }}>
            {config.header.visible ? config.name : ''}
          </Text>
        </Flex>

        <Flex align="center" gap={4}>
          {onExpand && (
            <Tooltip title="Expand">
              <Button type="text" size="small" icon={<FullscreenOutlined />} onClick={onExpand} />
            </Tooltip>
          )}

          {menuItems.length > 0 && (
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
              <Button type="text" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          )}
        </Flex>
      </Flex>

      {/* Content Area */}
      <div style={{ flexGrow: 1, position: 'relative', overflow: 'hidden', backgroundColor: config.chart?.backgroundColor || 'var(--ant-color-bg-container)' }}>
        {error ? (
          <Flex vertical align="center" justify="center" style={{ padding: 24, height: '100%', color: 'var(--ant-color-error)' }}>
            <ExclamationCircleOutlined style={{ fontSize: 40, marginBottom: 8 }} />
            <Text type="danger" style={{ textAlign: 'center' }}>{error.message || 'Failed to load data'}</Text>
            {onRefresh && (
              <Button type="text" onClick={onRefresh} style={{ marginTop: 16 }} icon={<SyncOutlined />} />
            )}
          </Flex>
        ) : isLoading ? (
          <Flex vertical style={{ padding: 16, height: '100%' }}>
            <Skeleton active title={{ width: '60%' }} paragraph={{ rows: 0 }} />
            <Skeleton.Button active style={{ width: '100%', height: '100%', marginTop: 8 }} block />
          </Flex>
        ) : (
          <div style={{ height: '100%', width: '100%', padding: 8 }}>
            {children}
          </div>
        )}
      </div>
    </Card>
  );
};
