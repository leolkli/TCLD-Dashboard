import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { WidthProvider } from 'react-grid-layout'; // fallback if normal doesn't work
import ResponsiveGridLayoutImport from 'react-grid-layout'; // Need to be careful with RGL exports
import type { Layout } from 'react-grid-layout';
import {
  Typography,
  Flex,
  Button,
  Input,
  Select,
  Tag,
  Tooltip,
  Alert,
  Modal,
  Card,
  Row,
  Col
} from 'antd';
import {
  SaveOutlined,
  DeleteOutlined,
  PlusOutlined,
  LineChartOutlined,
  DashboardOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useDashboardStore } from '@/store/dashboardStore';
import { createEmptyDashboard } from '@/types/dashboard';
import type { Dashboard, DashboardScope } from '@/types/dashboard';
import type { SynapsePortfolio } from '@/types/synapse';
import { synapseService } from '@/services/synapseService';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Fix for width provider
const ResponsiveGridLayout = WidthProvider(ResponsiveGridLayoutImport.Responsive || ResponsiveGridLayoutImport);

const { Title, Text } = Typography;

const scopeOptions: { value: DashboardScope; label: string }[] = [
  { value: 'portfolio-main', label: 'Portfolio Main Dashboard' },
  { value: 'building-main', label: 'Building Main Dashboard' },
  { value: 'building-sub', label: 'Building Sub-Dashboard' },
];

export const DashboardTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentDashboard,
    savedWidgets,
    dashboards,
    isLoading,
    saveDashboard,
    fetchAllDashboards,
    fetchSavedWidgets,
    setCurrentDashboard,
    addWidgetToDashboard,
    removeWidgetFromDashboard,
    updateLayout,
    deleteDashboard,
    deleteWidget,
  } = useDashboardStore();

  const [scope, setScope] = useState<DashboardScope>('building-main');
  const [portfolios, setPortfolios] = useState<SynapsePortfolio[]>([]);
  const [buildingsList, setBuildingsList] = useState<{ code: string; name: string }[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [dashboardName, setDashboardName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [modal, contextHolder] = Modal.useModal();

  useEffect(() => {
    const init = async () => {
      try {
        const hierarchy = await synapseService.getHierarchy();
        setPortfolios(hierarchy);
        const allBuildings: { code: string; name: string }[] = [];
        hierarchy.forEach((p) =>
          p.buildings.forEach((b) => {
            if (!allBuildings.find((x) => x.code === b.code)) {
              allBuildings.push(b);
            }
          }),
        );
        setBuildingsList(allBuildings);
      } catch {
        setPortfolios([]);
        setBuildingsList([]);
      }
      fetchAllDashboards();
      fetchSavedWidgets();
    };
    init();
  }, [fetchAllDashboards, fetchSavedWidgets]);

  useEffect(() => {
    let match: Dashboard | undefined;
    if (scope === 'portfolio-main' && selectedPortfolio) {
      match = dashboards.find(
        (d) => d.scope === 'portfolio-main' && d.portfolioName === selectedPortfolio,
      );
    } else if (scope === 'building-main' && selectedBuilding) {
      match = dashboards.find(
        (d) => d.scope === 'building-main' && d.buildingCode === selectedBuilding,
      );
    }

    if (match) {
      setCurrentDashboard(match);
      setDashboardName(match.name);
    } else if (scope !== 'building-sub') {
      setCurrentDashboard(null);
      setDashboardName('');
    }
  }, [scope, selectedPortfolio, selectedBuilding, dashboards, setCurrentDashboard]);

  const existingSubDashboards = dashboards.filter(
    (d) => d.scope === 'building-sub' && d.buildingCode === selectedBuilding,
  );

  const handleNewDashboard = useCallback(() => {
    const buildingName = buildingsList.find((b) => b.code === selectedBuilding)?.name;
    const dash = createEmptyDashboard(scope, {
      name: dashboardName || 'Untitled Dashboard',
      portfolioName: scope === 'portfolio-main' ? selectedPortfolio : undefined,
      buildingCode: scope !== 'portfolio-main' ? selectedBuilding : undefined,
      buildingName: scope !== 'portfolio-main' ? buildingName : undefined,
    });
    setCurrentDashboard(dash);
    setDashboardName(dash.name);
  }, [scope, selectedPortfolio, selectedBuilding, dashboardName, buildingsList, setCurrentDashboard]);

  const handleSave = useCallback(async () => {
    if (!currentDashboard) return;
    setSaveSuccess(false);
    try {
      const buildingName = buildingsList.find((b) => b.code === selectedBuilding)?.name;
      await saveDashboard({
        ...currentDashboard,
        name: dashboardName || currentDashboard.name,
        portfolioName: scope === 'portfolio-main' ? selectedPortfolio : currentDashboard.portfolioName,
        buildingCode: scope !== 'portfolio-main' ? selectedBuilding : currentDashboard.buildingCode,
        buildingName: scope !== 'portfolio-main' ? buildingName : currentDashboard.buildingName,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // error handled by store
    }
  }, [currentDashboard, dashboardName, scope, selectedPortfolio, selectedBuilding, buildingsList, saveDashboard]);

  const handleLayoutChange = useCallback(
    (layout: Layout[]) => {
      updateLayout(layout);
    },
    [updateLayout],
  );

  const handleLoadSubDashboard = useCallback(
    (dash: Dashboard) => {
      setCurrentDashboard(dash);
      setDashboardName(dash.name);
    },
    [setCurrentDashboard],
  );

  const showDeleteConfirm = useCallback((type: 'dashboard' | 'widget', id: string, name: string) => {
    modal.confirm({
      title: `Delete ${type === 'dashboard' ? 'Dashboard' : 'Widget'}`,
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        if (type === 'dashboard') {
          await deleteDashboard(id);
        } else {
          await deleteWidget(id);
        }
      },
    });
  }, [deleteDashboard, deleteWidget, modal]);

  const layouts = {
    lg: currentDashboard?.layout || [],
  };

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', padding: 24 }}>
      {contextHolder}
      
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Dashboard Configurator</Title>
          <Text type="secondary">Build and manage dashboard blueprints.</Text>
        </div>
        <Flex gap="small" align="center">
          {saveSuccess && <Alert message="Dashboard Saved" type="success" showIcon />}
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={isLoading}
            disabled={!currentDashboard}
          >
            Save Layout
          </Button>
          {currentDashboard && currentDashboard.id && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm('dashboard', currentDashboard.id, currentDashboard.name)}
            >
              Delete Dashboard
            </Button>
          )}
        </Flex>
      </div>

      <Row gutter={[24, 24]} style={{ flex: 1, minHeight: 0 }}>
        {/* LEFT COLUMN: Controls & Library */}
        <Col xs={24} md={6} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Scope Selection Card */}
          <Card 
            title="Dashboard Context" 
            variant="borderless" 
            className="shadow-sm" 
            style={{ marginBottom: 24 }}
          >
            <Flex vertical style={{ width: '100%' }} gap={16}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Scope Level</Text>
                <Select
                  style={{ width: '100%' }}
                  value={scope}
                  onChange={(val) => {
                    setScope(val);
                    setSelectedPortfolio('');
                    setSelectedBuilding('');
                    setDashboardName('');
                    setCurrentDashboard(null);
                  }}
                  options={scopeOptions}
                />
              </div>

              {scope === 'portfolio-main' && (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>Portfolio Target</Text>
                  <Select
                    style={{ width: '100%' }}
                    value={selectedPortfolio}
                    onChange={(val) => setSelectedPortfolio(val)}
                    placeholder="Select Portfolio"
                    options={portfolios.map(p => ({ label: p.name, value: p.name }))}
                  />
                </div>
              )}

              {scope !== 'portfolio-main' && (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>Building Target</Text>
                  <Select
                    style={{ width: '100%' }}
                    value={selectedBuilding}
                    onChange={(val) => {
                      setSelectedBuilding(val);
                      if (scope === 'building-sub') {
                        setCurrentDashboard(null);
                        setDashboardName('');
                      }
                    }}
                    placeholder="Select Building"
                    options={buildingsList.map(b => ({ label: `${b.name} (${b.code})`, value: b.code }))}
                  />
                </div>
              )}

              {scope === 'building-sub' && selectedBuilding && (
                <div style={{ marginTop: 12 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>Sub-Dashboards</Text>
                    <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 8 }}>
                      <Flex vertical gap={4}>
                        {existingSubDashboards.map(item => (
                          <div
                            key={item.id}
                            style={{ 
                              padding: '8px 12px', 
                              cursor: 'pointer', 
                              borderRadius: 4,
                              backgroundColor: currentDashboard?.id === item.id ? '#e6f4ff' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8
                            }}
                            onClick={() => handleLoadSubDashboard(item)}
                          >
                            <DashboardOutlined />
                            <Text>{item.name}</Text>
                          </div>
                        ))}
                      </Flex>
                      <div style={{ textAlign: 'center', marginTop: 8 }}>
                        <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={handleNewDashboard}>
                          Create New Sub-Dashboard
                        </Button>
                      </div>
                    </div>
                </div>
              )}

              {((scope === 'building-sub' && currentDashboard) || (scope !== 'building-sub')) && (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>Dashboard Name</Text>
                  <Input
                    value={dashboardName}
                    onChange={(e) => setDashboardName(e.target.value)}
                    placeholder="e.g. Overview"
                  />
                </div>
              )}

              {scope !== 'building-sub' && !currentDashboard && (selectedPortfolio || selectedBuilding) && (
                <Button type="dashed" block icon={<PlusOutlined />} onClick={handleNewDashboard} style={{ marginTop: 8 }}>
                  Initialize Dashboard Canvas
                </Button>
              )}
            </Flex>
          </Card>

          {/* Widget Library Card */}
          <Card
            title="Widget Library"
            extra={
              <Button type="link" onClick={() => navigate('/admin/widget-configurator')} style={{ padding: 0 }}>
                Manage Widgets
              </Button>
            }
            variant="borderless"
            className="shadow-sm"
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            styles={{ body: { flex: 1, overflowY: 'auto' } }}
          >
            {savedWidgets.length === 0 ? (
              <Text type="secondary">No saved widgets available. Create widgets in the Widget Configurator.</Text>
            ) : (
              <Flex vertical gap={8}>
                {savedWidgets.map((widget) => {
                  const isInLayout = currentDashboard?.layout.some((l) => l.i === widget.id);
                  return (
                    <Flex
                      key={widget.id}
                      align="center"
                      justify="space-between"
                      style={{ borderBottom: '1px solid #f0f0f0', padding: '12px 0' }}
                    >
                      <Flex align="center" gap={12}>
                        <LineChartOutlined style={{ fontSize: 24, color: '#1677ff' }} />
                        <div>
                          <Text strong style={{ display: 'block' }}>{widget.name}</Text>
                          <Tag color="blue">{widget.chart.type}</Tag>
                        </div>
                      </Flex>
                      <Flex gap={8}>
                        <Tooltip title={isInLayout ? "Already added" : "Add to Default Layout"} key="add">
                          <Button
                            type="primary"
                            size="small"
                            disabled={isInLayout || !currentDashboard || !widget.id}
                            onClick={() => addWidgetToDashboard(widget.id!, widget.name)}
                            icon={<PlusOutlined />}
                          />
                        </Tooltip>
                        <Tooltip title="Delete Widget" key="del">
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => showDeleteConfirm('widget', widget.id!, widget.name)}
                          />
                        </Tooltip>
                      </Flex>
                    </Flex>
                  );
                })}
              </Flex>
            )}
          </Card>
        </Col>

        {/* RIGHT COLUMN: Canvas */}
        <Col xs={24} md={18} style={{ height: '100%' }}>
          <Card 
            variant="borderless" 
            className="shadow-sm" 
            style={{ height: '100%', backgroundColor: '#f5f5f5', overflowY: 'auto' }}
            styles={{ body: { padding: 12 } }}
          >
            {!currentDashboard ? (
              <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Text type="secondary" style={{ fontSize: 16 }}>Select context and initialize dashboard to start arranging widgets.</Text>
              </div>
            ) : currentDashboard.layout.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Text type="secondary" style={{ fontSize: 16 }}>Dashboard is empty. Add widgets from the left panel.</Text>
              </div>
            ) : (
              <div style={{ minHeight: 600 }}>
                <ResponsiveGridLayout
                  className="layout"
                  layouts={layouts}
                  breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                  cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                  rowHeight={30}
                  onLayoutChange={handleLayoutChange}
                  draggableHandle=".drag-handle"
                >
                  {currentDashboard.layout.map((item) => {
                    const widgetInfo = savedWidgets.find((w) => w.id === item.i);
                    return (
                      <div key={item.i} style={{ border: '1px solid #d9d9d9', backgroundColor: 'white', borderRadius: 8, display: 'flex', flexDirection: 'column' }}>
                        <div
                          className="drag-handle"
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#fafafa',
                            borderBottom: '1px solid #f0f0f0',
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                            cursor: 'move',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <Text strong ellipsis style={{ width: '80%' }}>
                            {widgetInfo?.name || item.i}
                          </Text>
                          <Button 
                            type="text" 
                            danger 
                            size="small" 
                            icon={<DeleteOutlined />} 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeWidgetFromDashboard(item.i);
                            }} 
                          />
                        </div>
                        <div style={{ flex: 1, padding: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa' }}>
                          <Text type="secondary" style={{ fontSize: 24, opacity: 0.3 }}>
                            [ Echarts View ]
                          </Text>
                        </div>
                      </div>
                    );
                  })}
                </ResponsiveGridLayout>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
