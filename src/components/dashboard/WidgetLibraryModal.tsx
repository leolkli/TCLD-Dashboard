import React, { useState, useMemo } from 'react';
import {
  Modal,
  Button,
  Typography,
  Input,
  Pagination,
  Flex
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useDashboardGlobalStore } from '@/store/dashboardGlobalStore';
import { useDashboardStore } from '@/store/dashboardStore';

const { Text } = Typography;

export const WidgetLibraryModal: React.FC = () => {
  const { isWidgetLibraryOpen, setWidgetLibraryOpen } = useDashboardGlobalStore();
  const { savedWidgets, addWidgetToDashboard, currentDashboard } = useDashboardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const handleClose = () => {
    setWidgetLibraryOpen(false);
    setSearchQuery('');
    setPage(1);
  };

  const handleAddWidget = (widgetId: string, widgetName: string) => {
    addWidgetToDashboard(widgetId, widgetName);
  };

  const filteredWidgets = useMemo(() => {
    let filtered = savedWidgets;

    // 1. Filter by building/portfolio based on current dashboard
    if (currentDashboard) {
      if (currentDashboard.scope === 'portfolio-main') {
        filtered = filtered.filter(w => w.widgetScope === 'portfolio' && w.portfolioName === currentDashboard.portfolioName);
      } else {
        filtered = filtered.filter(w => w.widgetScope === 'building' && w.buildingCode === currentDashboard.buildingCode);
      }
    }

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(w => w.name.toLowerCase().includes(lowerQuery));
    }

    return filtered;
  }, [savedWidgets, currentDashboard, searchQuery]);

  const paginatedWidgets = filteredWidgets.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  return (
    <Modal 
      open={isWidgetLibraryOpen} 
      onCancel={handleClose} 
      title="Widget Library"
      footer={[
        <Button key="done" onClick={handleClose}>
          Done
        </Button>
      ]}
      width={600}
      styles={{
        body: { display: 'flex', flexDirection: 'column', gap: 16, minHeight: '400px', paddingTop: 16 }
      }}
    >
      <Input
        placeholder="Search by widget name..."
        prefix={<SearchOutlined />}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setPage(1);
        }}
        allowClear
      />

      {filteredWidgets.length === 0 ? (
        <Text type="secondary" style={{ marginTop: 16, textAlign: 'center', display: 'block' }}>
          No saved widgets found.
        </Text>
      ) : (
        <Flex vertical style={{ flex: 1, justifyContent: 'space-between' }}>
            <Flex vertical gap={0}>
              {paginatedWidgets.map(widget => (
                <Flex
                  key={widget.id}
                  justify="space-between"
                  align="center"
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <div>
                    <Typography.Text strong style={{ display: 'block' }}>{widget.name}</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                      {`${widget.chart.type.toUpperCase()} • ${widget.dataPoints.length} Metrics`}
                    </Typography.Text>
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddWidget(widget.id!, widget.name)}
                    aria-label="add"
                  />
                </Flex>
              ))}
            </Flex>
          {filteredWidgets.length > itemsPerPage && (
            <Flex justify="center" style={{ marginTop: 16 }}>
              <Pagination 
                current={page} 
                total={filteredWidgets.length} 
                pageSize={itemsPerPage} 
                onChange={handlePageChange} 
                showSizeChanger={false}
              />
            </Flex>
          )}
        </Flex>
      )}
    </Modal>
  );
};
