import React, { useEffect, useState, useCallback } from 'react';
import { 
  Typography, Row, Col, Input, Button, Space, Alert, Divider, 
  Radio, Checkbox, Drawer, Tag, Select, DatePicker, Card, Flex
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useVtagStore } from '@/store/vtagStore';
import { FormulaBuilder, checkFormulaValidity } from '@/components/vtag/FormulaBuilder';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const VtagConfiguratorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const historyParam = searchParams.get('history');
  
  const { config, setConfig, historyOverlaps, checkDateOverlaps, saveVtag, saveSuccessMsg, error, resetConfig } = useVtagStore();
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(historyParam === 'true');
  const [historyList, setHistoryList] = useState<any[]>([]);

  const fetchHistory = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/vtags/${id}/history`);
      const data = await res.json();
      if (data.success) {
        setHistoryList(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    if (historyDrawerOpen) {
      fetchHistory();
    }
  }, [historyDrawerOpen, fetchHistory]);

  const handleLoadHistoricalVersion = (vtagVersion: any) => {
    setConfig(vtagVersion);
    setHistoryDrawerOpen(false);
  };

  const mockHistoricalDates = [
    { start: '2023-01-01T00:00:00Z', end: '2023-12-31T23:59:59Z' }
  ];

  useEffect(() => {
    checkDateOverlaps(mockHistoricalDates);
  }, [config.effectiveFrom, config.effectiveTo, checkDateOverlaps]);

  useEffect(() => {
    if (id) {
      fetch(`/api/vtags/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setConfig(data.data);
          }
        })
        .catch(err => console.error("Error loading Vtag:", err));
    } else {
      resetConfig();
    }
  }, [id, setConfig, resetConfig]);

  const isFormulaValid = config.formulaTokens ? checkFormulaValidity(config.formulaTokens).valid : false;

  const handleDateChange = (field: 'effectiveFrom' | 'effectiveTo', date: dayjs.Dayjs | null) => {
    if (date) setConfig({ [field]: date.toISOString() });
  };

  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Space size="large" align="center">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/vtags')} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {id ? 'Edit Virtual Tag' : 'Create Virtual Tag'}
            </Title>
            <Text type="secondary">
              Calculation sequence level: {config.calculationLevel}
            </Text>
          </div>
        </Space>
        
        <Space>
          {error && (
            <Alert title="Save Failed" description={error} type="error" showIcon style={{ padding: '4px 12px' }} />
          )}
          {saveSuccessMsg && (
            <Alert title={saveSuccessMsg} type="success" showIcon style={{ padding: '4px 12px' }} />
          )}
          <Button 
            icon={<HistoryOutlined />}
            onClick={() => setHistoryDrawerOpen(true)}
          >
            History Library
          </Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />}
            onClick={saveVtag}
            disabled={historyOverlaps || !config.name || !isFormulaValid || config.formulaTokens.length === 0}
          >
            Save Configuration
          </Button>
        </Space>
      </div>

      {historyOverlaps && (
        <Alert 
          title="Overlap Error" 
          description="The selected Effective Period overlaps with an existing historical configuration for this Vtag. Please select a non-overlapping date range." 
          type="error" 
          showIcon 
          style={{ marginBottom: 24 }} 
        />
      )}

      <Row gutter={[24, 24]} style={{ flex: 1 }}>
        <Col xs={24} md={8}>
          <Flex vertical gap="large" style={{ display: 'flex' }}>
            {/* Identity Block */}
            <Card title="Core Identity" variant="borderless" className="shadow-sm">
              <Flex vertical gap="middle" style={{ width: '100%' }}>
                <div>
                  <Text strong>System Code</Text>
                  <Input 
                    value={id ? (config.systemCode || '') : 'System Generated on Save'} 
                    disabled 
                  />
                </div>
                <div>
                  <Text strong>Vtag Name <span style={{color: 'red'}}>*</span></Text>
                  <Input 
                    value={config.name} 
                    onChange={(e) => setConfig({ name: e.target.value })}
                  />
                </div>
                <div>
                  <Text strong>Description</Text>
                  <TextArea 
                    value={config.description} 
                    onChange={(e) => setConfig({ description: e.target.value })}
                    rows={2}
                  />
                </div>
                
                <Divider style={{ margin: '12px 0' }} />
                
                <Text strong>Effective Period</Text>
                <div>
                  <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>Valid From</Text>
                  <DatePicker 
                    value={config.effectiveFrom ? dayjs(config.effectiveFrom) : null}
                    onChange={(date) => handleDateChange('effectiveFrom', date)}
                    status={historyOverlaps ? 'error' : ''}
                    style={{ width: '100%' }}
                  />
                </div>
                <Space align="center" style={{ width: '100%' }}>
                  <div style={{ flex: 1 }}>
                    <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>Valid To</Text>
                    <DatePicker 
                      value={config.effectiveTo ? dayjs(config.effectiveTo) : null}
                      onChange={(date) => handleDateChange('effectiveTo', date)}
                      status={historyOverlaps ? 'error' : ''}
                      disabled={config.effectiveTo.startsWith('2999-12-31')}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <Checkbox 
                    style={{ marginTop: 18 }}
                    checked={config.effectiveTo.startsWith('2999-12-31')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConfig({ effectiveTo: '2999-12-31T00:00:00.000Z' });
                      } else {
                        const date = new Date();
                        date.setFullYear(date.getFullYear() + 1);
                        setConfig({ effectiveTo: date.toISOString() });
                      }
                    }}
                  >
                    Current
                  </Checkbox>
                </Space>
              </Flex>
            </Card>

            {/* Data Source Block */}
            <Card title="Data Source & Format" variant="borderless" className="shadow-sm">
              <Flex vertical gap="large" style={{ width: '100%' }}>
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>Data Type</Text>
                  <Radio.Group 
                    value={config.dataType}
                    onChange={(e) => setConfig({ dataType: e.target.value })}
                  >
                    <Radio value="actual">Actual</Radio>
                    <Radio value="accumulated">Accumulated (Acc)</Radio>
                  </Radio.Group>
                </div>

                <Divider style={{ margin: '0' }} />
                
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 12 }}>Aggregation</Text>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Calculation Step</Text>
                      <Select
                        value={config.calculationStep}
                        onChange={(value) => setConfig({ calculationStep: value })}
                        style={{ width: '100%' }}
                        options={['raw', 'hourly', 'daily', 'monthly', 'yearly'].map(opt => ({
                          label: opt.charAt(0).toUpperCase() + opt.slice(1),
                          value: opt
                        }))}
                      />
                    </Col>
                    <Col span={12}>
                      <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Function</Text>
                      <Select
                        value={config.calculationType}
                        onChange={(value) => setConfig({ calculationType: value })}
                        disabled={config.calculationStep === 'raw'}
                        style={{ width: '100%' }}
                        options={['none', 'mean', 'sum', 'count', 'min', 'max'].map(opt => ({
                          label: opt.charAt(0).toUpperCase() + opt.slice(1),
                          value: opt
                        }))}
                      />
                    </Col>
                  </Row>
                </div>
              </Flex>
            </Card>
          </Flex>
        </Col>

        <Col xs={24} md={16}>
          <Card 
            title="Formula Builder" 
            variant="borderless" 
            className="shadow-sm"
            styles={{ body: { padding: 0 } }}
            extra={<Text type="secondary" style={{ fontWeight: 'normal' }}>Drag logic tags from the palette or type freely in the builder to establish calculation logic.</Text>}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ padding: 16, flex: 1, backgroundColor: '#fafafa', minHeight: 400 }}>
              <FormulaBuilder />
            </div>
          </Card>
        </Col>
      </Row>

      {/* History Drawer */}
      <Drawer
        title="Version History"
        placement="right"
        size="default"
        onClose={() => setHistoryDrawerOpen(false)}
        open={historyDrawerOpen}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Click a version to load its configuration into the editor. Note that saving will ALWAYS create a new version marked Active.
        </Text>
        <Divider style={{ margin: '16px 0' }} />
        {historyList.length === 0 ? (
          <Text type="secondary">No history found.</Text>
        ) : (
          <Flex vertical gap={8}>
            {historyList.map(version => (
              <div
                key={version.version}
                onClick={() => handleLoadHistoricalVersion(version)}
                style={{
                  cursor: 'pointer',
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  padding: '12px 16px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1677ff'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#f0f0f0'}
              >
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text strong>Version {version.version || 1}</Text>
                    <Tag color={version.status === 'Active' ? 'success' : 'default'} style={{ margin: 0 }}>
                      {version.status}
                    </Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                    From: {new Date(version.effectiveFrom).toLocaleDateString()}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                    To: {new Date(version.effectiveTo).toLocaleDateString()}
                  </Text>
                </div>
              </div>
            ))}
          </Flex>
        )}
      </Drawer>
    </div>
  );
};