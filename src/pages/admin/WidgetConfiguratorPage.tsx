import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  Card,
  Button,
  Tooltip,
  Tabs,
  Input,
  Modal,
  Space,
  Typography,
  Flex,
} from 'antd';
import {
  SettingOutlined as GeneralIcon,
  FileTextOutlined as HeaderIcon,
  AreaChartOutlined as ChartIcon,
  BorderOuterOutlined as ScaleIcon,
  ReloadOutlined as RefreshIcon,
  RestOutlined as ResetIcon,
  CopyOutlined as CopyIcon,
  BankOutlined as BuildingIcon,
  SaveOutlined as SaveIcon,
  BookOutlined as LibraryIcon,
} from '@ant-design/icons';
import { ChartPreview } from '@/components/charts/ChartPreview';
import {
  BuildingSelector,
  DataPointSelector,
  DateRangeSettings,
  GeneralSettings,
  HeaderSettings,
  ChartSettings,
  ScaleSettings,
} from '@/components/widget-configurator';
import { WidgetLibraryModal } from '@/components/widget-configurator/WidgetLibraryModal';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import { useBlocker } from 'react-router-dom';

const { Text, Title } = Typography;

export const WidgetConfiguratorPage: React.FC = () => {
  const { config, fetchPreviewData, resetConfig, saveWidget, isLoading } =
    useWidgetConfigStore();

  const [tabValue, setTabValue] = useState<number>(0);
  const [libraryModalOpen, setLibraryModalOpen] = useState<boolean>(false);
  const fetchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset config on mount
  useEffect(() => {
    resetConfig();
  }, [resetConfig]);

  // Determine if there are unsaved essential changes
  const hasUnsavedChanges =
    !config.id &&
    (config.buildingCode !== '' ||
      (config.portfolioName || '') !== '' ||
      config.dataPoints.length > 0 ||
      config.name !== 'New Widget' ||
      config.general.title !== 'New Widget' ||
      config.chart.type !== 'line');

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  // Determine if the current chart relationship requires X & Y axis split (e.g., Scatter plot)
  const isComparing = config.chart.relationship === 'comparing-categories';

  // Build Visual panels (Dynamic based on selected chart type logic)
  const buildPanels = [
    {
      key: 'building',
      label: 'Building Filter',
      icon: <BuildingIcon style={{ fontSize: '14px' }} />,
      Component: BuildingSelector,
    },
    {
      key: 'chart-data',
      label: 'Chart Type and Data Selection',
      icon: <ChartIcon style={{ fontSize: '14px' }} />,
      Component: () => {
        const { config, updateGeneral } = useWidgetConfigStore();
        return (
          <Flex vertical gap="large" style={{ width: '100%' }}>
            <div>
              <Text
                strong
                style={{
                  marginBottom: '12px',
                  color: '#1890ff',
                  borderBottom: '1px solid #d9d9d9',
                  paddingBottom: '8px',
                  display: 'block',
                }}
              >
                Widget Title
              </Text>
              <Input
                placeholder="Widget Title"
                value={config.general.title}
                onChange={(e) => updateGeneral({ title: e.target.value })}
                size="small"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <Text
                strong
                style={{
                  marginBottom: '12px',
                  color: '#1890ff',
                  borderBottom: '1px solid #d9d9d9',
                  paddingBottom: '8px',
                  display: 'block',
                }}
              >
                Chart Strategy
              </Text>
              <ChartSettings />
            </div>
            <div>
              <Text
                strong
                style={{
                  marginBottom: '12px',
                  color: '#1890ff',
                  borderBottom: '1px solid #d9d9d9',
                  paddingBottom: '8px',
                  display: 'block',
                }}
              >
                {isComparing ? 'Y-Axis Data Points' : 'Data Points'}
              </Text>
              <DataPointSelector axis="y" />
              {isComparing && (
                <div style={{ marginTop: '24px' }}>
                  <Text
                    strong
                    style={{
                      marginBottom: '12px',
                      color: '#1890ff',
                      borderBottom: '1px solid #d9d9d9',
                      paddingBottom: '8px',
                      display: 'block',
                    }}
                  >
                    X-Axis Data Point
                  </Text>
                  <DataPointSelector axis="x" limit={1} />
                </div>
              )}
            </div>
            <div>
              <Text
                strong
                style={{
                  marginBottom: '12px',
                  color: '#1890ff',
                  borderBottom: '1px solid #d9d9d9',
                  paddingBottom: '8px',
                  display: 'block',
                }}
              >
                Aggregation
              </Text>
              <DateRangeSettings />
            </div>
          </Flex>
        );
      },
    },
  ];

  // Format Visual panels (Purely cosmetic)
  const formatPanels = [
    {
      key: 'header',
      label: 'Widget Header Settings',
      icon: <HeaderIcon style={{ fontSize: '14px' }} />,
      Component: HeaderSettings,
    },
    {
      key: 'visual-formatting',
      label: 'Visual Formatting',
      icon: <GeneralIcon style={{ fontSize: '14px' }} />,
      Component: GeneralSettings,
    },
    {
      key: 'scales',
      label: 'Axes & Scales',
      icon: <ScaleIcon style={{ fontSize: '14px' }} />,
      Component: ScaleSettings,
    },
  ];

  // Debounced fetch when config changes
  useEffect(() => {
    if (config.dataPoints.length === 0) return;
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(() => {
      fetchPreviewData();
    }, 600);
    return () => {
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    };
  }, [
    config.dataPoints,
    config.dateRange.preset,
    config.dateRange.customStart,
    config.dateRange.customEnd,
    config.dateRange.aggregation,
    fetchPreviewData,
  ]);

  const handleCopyJSON = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
  }, [config]);

  const tabItems = [
    { label: 'Build Visual', key: '0' },
    { label: 'Format Visual', key: '1' },
  ];

  return (
    <Flex
      vertical
      style={{
        height: 'calc(100vh - 64px)',
        padding: 0,
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingTop: '12px',
          paddingBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #d9d9d9',
          backgroundColor: '#fafafa',
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
            Widget Configurator
          </Title>
          <Text type="secondary">Configure and preview chart widgets</Text>
        </div>
        <Space size="small">
          <Button
            type="default"
            size="small"
            icon={<LibraryIcon />}
            onClick={() => setLibraryModalOpen(true)}
          >
            Library
          </Button>
          <Tooltip title="Copy config as JSON">
            <Button
              type="text"
              icon={<CopyIcon />}
              size="small"
              onClick={handleCopyJSON}
            />
          </Tooltip>
          <Tooltip title="Reset all settings">
            <Button
              type="default"
              size="small"
              icon={<ResetIcon />}
              onClick={resetConfig}
            >
              Reset
            </Button>
          </Tooltip>
          <Button
            type="primary"
            size="small"
            icon={<RefreshIcon />}
            onClick={fetchPreviewData}
            disabled={isLoading || config.dataPoints.length === 0}
          >
            Fetch Data
          </Button>
          <Button
            type="primary"
            danger={false}
            size="small"
            icon={<SaveIcon />}
            onClick={saveWidget}
            disabled={isLoading || !config.name || config.dataPoints.length === 0}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            {config.id ? 'Update Widget' : 'Save Widget'}
          </Button>
        </Space>
      </div>

      {/* Split Layout */}
      <Flex style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Left: Chart Preview */}
        <div
          style={{
            flex: '0 0 60%',
            maxWidth: '60%',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Card
            style={{
              flex: 1,
              border: '1px solid #d9d9d9',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
            styles={{ body: { flex: 1, padding: 0, overflow: 'hidden' } }}
          >
            <ChartPreview />
          </Card>
        </div>

        {/* Right: Settings Panel with Tabs */}
        <div
          style={{
            flex: '0 0 40%',
            maxWidth: '40%',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid #d9d9d9',
            backgroundColor: '#fafafa',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              borderBottom: '1px solid #d9d9d9',
              backgroundColor: '#fff',
            }}
          >
            <Tabs
              activeKey={String(tabValue)}
              onChange={(key) => setTabValue(Number(key))}
              items={tabItems}
              style={{ margin: 0 }}
            />
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
            }}
          >
            <Flex vertical gap="middle">
              {(tabValue === 0 ? buildPanels : formatPanels).map(
                ({ key, label, icon, Component }) => (
                  <div key={key}>
                    <Flex gap="8px" align="center" style={{ marginBottom: '12px' }}>
                      {icon}
                      <Text strong>{label}</Text>
                    </Flex>
                    <Card
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: '4px',
                        border: '1px solid #d9d9d9',
                      }}
                      styles={{ body: { padding: '16px' } }}
                    >
                      <Component />
                    </Card>
                  </div>
                )
              )}
            </Flex>
          </div>
        </div>
      </Flex>

      <WidgetLibraryModal
        open={libraryModalOpen}
        onClose={() => setLibraryModalOpen(false)}
      />

      <Modal
        title="Unsaved Changes"
        open={blocker.state === 'blocked'}
        onCancel={() => {
          if (blocker.state === 'blocked') blocker.reset();
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              if (blocker.state === 'blocked') blocker.reset();
            }}
          >
            Stay
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            onClick={() => {
              if (blocker.state === 'blocked') blocker.proceed();
            }}
          >
            Leave
          </Button>,
        ]}
      >
        <Text>
          You have unsaved changes in your data points, building, chart type, or
          title. Are you sure you want to leave?
        </Text>
      </Modal>
    </Flex>
  );
};
