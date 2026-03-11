import React, { useState } from 'react';
import { 
  Flex, 
  Button, 
  Select, 
  Typography, 
  Tag, 
  Modal, 
  Input, 
  Space 
} from 'antd';
import { 
  EditOutlined, 
  SaveOutlined, 
  PlusOutlined, 
  CalendarOutlined 
} from '@ant-design/icons';

import { useDashboardGlobalStore } from '@/store/dashboardGlobalStore';
import { useDashboardStore } from '@/store/dashboardStore';
import type { DateRangePreset } from '@/types/widget';

const { Title } = Typography;

const PRESETS = [
  { label: 'Today', value: '1D' },
  { label: 'Last 7 Days', value: '1W' },
  { label: 'Last 30 Days', value: '1M' },
  { label: 'Last 3 Months', value: '3M' },
  { label: 'Last 6 Months', value: '6M' },
  { label: 'Last Year', value: '1Y' },
  { label: 'All Time', value: 'ALL' },
  { label: 'Custom Range', value: 'custom' }
];

export const DashboardToolbar: React.FC = () => {
  const { 
    isEditMode, 
    setEditMode, 
    globalFilters, 
    setGlobalDateRangePreset,
    setGlobalDateRangeCustom,
    setWidgetLibraryOpen 
  } = useDashboardGlobalStore();
  const { currentDashboard, saveDashboard } = useDashboardStore();
  const [isSaving, setIsSaving] = useState(false);

  // Custom date picker state
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [tempStart, setTempStart] = useState(globalFilters.dateRange.customStart || '');
  const [tempEnd, setTempEnd] = useState(globalFilters.dateRange.customEnd || '');

  const handleDatePresetChange = (value: string) => {
    if (value === 'custom') {
      setCustomDialogOpen(true);
    } else {
      setGlobalDateRangePreset(value as DateRangePreset);
    }
  };

  const handleApplyCustomDate = () => {
    setGlobalDateRangeCustom(tempStart, tempEnd);
    setCustomDialogOpen(false);
  };

  const handleSave = async () => {
    if (!currentDashboard) return;
    setIsSaving(true);
    try {
      await saveDashboard(currentDashboard);
      setEditMode(false);
    } catch (error) {
      console.error("Failed to save dashboard", error);
      // maybe add toast notification here
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Flex 
      align="center" 
      justify="space-between" 
      wrap="wrap" 
      gap={16} 
      style={{
        marginBottom: 24,
        padding: 16,
        backgroundColor: 'var(--ant-color-bg-container)',
        borderRadius: 8,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Left side: Title and Status */}
      <Flex align="center" gap={16}>
        <Title level={4} style={{ margin: 0 }}>
          {currentDashboard?.name || 'Dashboard'}
        </Title>
        {isEditMode && (
          <Tag color="warning" bordered={false}>Editing Layout</Tag>
        )}
      </Flex>

      {/* Right side: Global Filters & Actions */}
      <Flex align="center" gap={16}>
        {/* Global Date Filter */}
        <Select
          value={globalFilters.dateRange.preset}
          onChange={handleDatePresetChange}
          style={{ width: 160 }}
          options={PRESETS}
          suffixIcon={<CalendarOutlined />}
        />

        {/* Action Buttons */}
        {isEditMode ? (
          <>
            <Button 
              icon={<PlusOutlined />}
              onClick={() => setWidgetLibraryOpen(true)}
            >
              Add Widget
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Layout'}
            </Button>
            <Button 
              type="text" 
              onClick={() => setEditMode(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button 
            icon={<EditOutlined />}
            onClick={() => setEditMode(true)}
          >
            Edit Layout
          </Button>
        )}
      </Flex>

      <Modal 
        title="Select Custom Date Range" 
        open={customDialogOpen} 
        onCancel={() => setCustomDialogOpen(false)}
        onOk={handleApplyCustomDate}
        okText="Apply"
      >
        <Space style={{ marginTop: 8 }} size="middle">
          <Input
            type="date"
            placeholder="Start Date"
            value={tempStart}
            onChange={(e) => setTempStart(e.target.value)}
          />
          <Input
            type="date"
            placeholder="End Date"
            value={tempEnd}
            onChange={(e) => setTempEnd(e.target.value)}
          />
        </Space>
      </Modal>
    </Flex>
  );
};
