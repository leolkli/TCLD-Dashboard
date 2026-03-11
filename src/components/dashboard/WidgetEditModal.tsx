import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, Flex } from 'antd';
import { useDashboardGlobalStore } from '@/store/dashboardGlobalStore';
import { useDashboardStore } from '@/store/dashboardStore';
import type { WidgetChartType } from '@/types/widget';

const CHART_TYPES = [
  { value: 'line', label: 'Line Chart' },
  { value: 'bar', label: 'Bar Chart' },
  { value: 'area', label: 'Area Chart' },
  { value: 'kpi', label: 'KPI Card' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'scatter', label: 'Scatter Plot' }
];

export const WidgetEditModal: React.FC = () => {
  const { editingWidgetId, setEditingWidgetId } = useDashboardGlobalStore();
  const { savedWidgets, saveWidget } = useDashboardStore();

  const [localName, setLocalName] = useState('');
  const [localType, setLocalType] = useState<WidgetChartType>('line');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when modal opens for a specific widget
  useEffect(() => {
    if (editingWidgetId) {
      const widget = savedWidgets.find(w => w.id === editingWidgetId);
      if (widget) {
        setLocalName(widget.name);
        setLocalType(widget.chart.type);
      }
    }
  }, [editingWidgetId, savedWidgets]);

  const handleClose = () => {
    setEditingWidgetId(null);
  };

  const handleSave = async () => {
    if (!editingWidgetId) return;
    const widget = savedWidgets.find(w => w.id === editingWidgetId);
    if (!widget) return;

    setIsSaving(true);
    try {
      const updatedConfig = {
        ...widget,
        name: localName,
        chart: {
          ...widget.chart,
          type: localType,
        }
      };
      await saveWidget(updatedConfig);
      handleClose();
    } catch (err) {
      console.error('Failed to update widget', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal 
      open={!!editingWidgetId} 
      onCancel={handleClose} 
      onOk={handleSave}
      title="Edit Widget Configuration"
      okText={isSaving ? 'Saving...' : 'Save Changes'}
      confirmLoading={isSaving}
      width={400}
    >
      <Flex vertical gap={24} style={{ marginTop: 16, marginBottom: 16 }}>
        <Flex vertical gap={8}>
          <label>Widget Name</label>
          <Input
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
          />
        </Flex>
        
        <Flex vertical gap={8}>
          <label>Chart Type</label>
          <Select
            value={localType}
            onChange={(value) => setLocalType(value as WidgetChartType)}
            options={CHART_TYPES}
          />
        </Flex>
      </Flex>
    </Modal>
  );
};
