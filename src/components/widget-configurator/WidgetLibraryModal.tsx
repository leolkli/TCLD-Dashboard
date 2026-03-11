import React, { useEffect, useState } from 'react';
import { Modal, Typography, Card, Spin, Alert, Tag, Flex } from 'antd';
import { DeleteOutlined, AreaChartOutlined } from '@ant-design/icons';
import { synapseService } from '@/services/synapseService';
import type { WidgetConfiguration } from '@/types/widget';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';

interface WidgetLibraryModalProps {
  open: boolean;
  onClose: () => void;
}

export const WidgetLibraryModal: React.FC<WidgetLibraryModalProps> = ({ open, onClose }) => {
  const [widgets, setWidgets] = useState<WidgetConfiguration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { config, setConfig } = useWidgetConfigStore();

  const fetchWidgets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await synapseService.getWidgets();
      setWidgets(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch widgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchWidgets();
    }
  }, [open]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this widget?')) return;
    
    try {
      await synapseService.deleteWidget(id);
      setWidgets(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete widget');
    }
  };

  const handleSelectWidget = (widget: WidgetConfiguration) => {
    setConfig(widget);
    onClose();
  };

  const filteredWidgets = widgets.filter(w => {
    if (config.widgetScope === 'portfolio') {
      return w.portfolioName === config.portfolioName;
    }
    return w.buildingCode === config.buildingCode;
  });

  return (
    <Modal
      title="Widget Library"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      styles={{ body: { backgroundColor: '#fafafa', minHeight: 400, padding: 24 } }}
    >
      {loading ? (
        <Flex justify="center" align="center" style={{ height: 300 }}>
          <Spin size="large" />
        </Flex>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : filteredWidgets.length === 0 ? (
        <Flex vertical justify="center" align="center" style={{ height: 300, color: 'rgba(0,0,0,0.45)' }}>
          <AreaChartOutlined style={{ fontSize: 64, marginBottom: 16, opacity: 0.5 }} />
          <Typography.Title level={5} style={{ color: 'inherit', marginTop: 0 }}>No widgets found</Typography.Title>
          <Typography.Text type="secondary">
            No saved widgets match the currently selected {config.widgetScope === 'portfolio' ? 'portfolio' : 'building'}.
          </Typography.Text>
        </Flex>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {filteredWidgets.map((w) => (
            <Card
              key={w.id}
              hoverable
              onClick={() => handleSelectWidget(w)}
              styles={{ body: { padding: 16, display: 'flex', flexDirection: 'column', height: '100%' } }}
              style={{ height: '100%', borderRadius: 8 }}
            >
              <Flex justify="space-between" align="flex-start" style={{ marginBottom: 8 }}>
                <Typography.Text strong ellipsis style={{ maxWidth: '80%' }}>
                  {w.name || w.general?.title || 'Unnamed Widget'}
                </Typography.Text>
                {w.id && (
                  <DeleteOutlined
                    onClick={(e) => handleDelete(e, w.id as string)}
                    style={{ color: '#ff4d4f', padding: 4 }}
                  />
                )}
              </Flex>
              <Flex gap="small" wrap="wrap" style={{ marginBottom: 16 }}>
                <Tag color="blue">{w.chart?.type.toUpperCase() || 'CHART'}</Tag>
                <Tag>{w.dataPoints?.length || 0} Data Point(s)</Tag>
              </Flex>
              <Typography.Text type="secondary" style={{ fontSize: 12, marginTop: 'auto' }}>
                {w.widgetScope === 'portfolio' ? `Portfolio: ${w.portfolioName}` : `Building: ${w.buildingCode}`}
              </Typography.Text>
            </Card>
          ))}
        </div>
      )}
    </Modal>
  );
};
