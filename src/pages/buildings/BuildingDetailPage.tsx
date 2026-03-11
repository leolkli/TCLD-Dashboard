import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  Breadcrumb,
  Typography,
  Tabs,
  Table,
  Button,
  Modal,
  Spin,
  Alert,
  Tag,
  Flex
} from 'antd';
import {
  BarChartOutlined,
  SettingOutlined,
  LineChartOutlined,
  RightOutlined
} from '@ant-design/icons';
import { synapseService, ReadingsResponse } from '@/services/synapseService';
import { BuildingTagsResponse, SynapsePTag } from '@/types/synapse';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

export const BuildingDetailPage: React.FC = () => {
  const { buildingId } = useParams<{ buildingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const buildingName = location.state?.buildingName || buildingId;

  const [tagsData, setTagsData] = useState<BuildingTagsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState('0');

  // Chart State
  const [selectedTag, setSelectedTag] = useState<SynapsePTag | null>(null);
  const [chartData, setChartData] = useState<ReadingsResponse | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  const [chartOpen, setChartOpen] = useState(false);

  useEffect(() => {
    if (!buildingId) return;

    const fetchData = async () => {
      try {
        const data = await synapseService.getBuildingTags(buildingId);
        setTagsData(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch tags.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [buildingId]);

  const handleOpenChart = async (tag: SynapsePTag) => {
    setSelectedTag(tag);
    setChartOpen(true);
    setChartLoading(true);
    setChartError(null);
    setChartData(null);

    try {
      const data = await synapseService.getReadings(tag.Code);
      setChartData(data);
    } catch (err: any) {
      console.error(err);
      setChartError(err.message || 'Failed to load readings');
    } finally {
      setChartLoading(false);
    }
  };

  const handleCloseChart = () => {
    setChartOpen(false);
    setSelectedTag(null);
    setChartData(null);
  };

  const tagsColumns = [
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_: any, tag: SynapsePTag) => (
        <Button
          type="primary"
          size="small"
          icon={<LineChartOutlined />}
          onClick={() => handleOpenChart(tag)}
          disabled={!tag.F_tablename}
        >
          Plot
        </Button>
      ),
    },
    {
      title: 'Tag Code',
      dataIndex: 'Code',
      key: 'code',
      render: (text: string) => (
        <Text code style={{ fontSize: '12px', maxWidth: '200px' }} ellipsis title={text}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'Name',
      key: 'name',
    },
    {
      title: 'System',
      dataIndex: 'System',
      key: 'system',
    },
    {
      title: 'UOM',
      dataIndex: 'UOM',
      key: 'uom',
    },
    {
      title: 'Mapped Fact Table',
      dataIndex: 'F_tablename',
      key: 'factTable',
      render: (text: string) =>
        text ? (
          <Text>{text}</Text>
        ) : (
          <Text type="danger">Not Mapped</Text>
        ),
    },
  ];

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '200px' }}>
        <Spin />
      </Flex>
    );
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" style={{ margin: '16px' }} />;
  }

  if (!tagsData) {
    return <Alert message="No data found." type="warning" style={{ margin: '16px' }} />;
  }

  const tabItems = [
    {
      key: '0',
      label: (
        <span>
          <BarChartOutlined />
          Physical Tags ({tagsData.physicalTags.length})
        </span>
      ),
      children: (
        <Table
          size="small"
          dataSource={tagsData.physicalTags}
          columns={tagsColumns}
          rowKey="Code"
          locale={{ emptyText: 'No physical tags found for this building.' }}
        />
      ),
    },
    {
      key: '1',
      label: (
        <span>
          <SettingOutlined />
          Virtual Tags (0)
        </span>
      ),
      disabled: true,
      children: <Paragraph>Virtual tags feature coming soon.</Paragraph>,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumbs */}
      <Breadcrumb
        separator={<RightOutlined />}
        style={{ marginBottom: '16px' }}
        items={[
          {
            title: (
              <a onClick={() => navigate('/buildings')}>Buildings</a>
            ),
          },
          {
            title: buildingName,
          },
        ]}
      />

      <Flex align="center" gap="small" style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          {buildingName}
        </Title>
        <Tag>{buildingId}</Tag>
      </Flex>

      <Card>
        <Tabs
          activeKey={tabIndex}
          onChange={setTabIndex}
          items={tabItems}
        />
      </Card>

      {/* Chart Modal */}
      <Modal
        title={
          <Flex justify="space-between" align="center">
            <Title level={5} style={{ margin: 0 }}>
              Trend: {selectedTag?.Name}
            </Title>
          </Flex>
        }
        open={chartOpen}
        onCancel={handleCloseChart}
        footer={[
          <Button key="close" onClick={handleCloseChart}>
            Close
          </Button>,
        ]}
        width="90%"
        style={{ maxWidth: '1200px' }}
      >
        {selectedTag && (
          <Text type="secondary" style={{ display: 'block', marginBottom: '16px', fontSize: '12px' }}>
            {selectedTag.Code} ({selectedTag.UOM})
          </Text>
        )}
        {chartLoading ? (
          <Flex justify="center" align="center" style={{ height: '200px' }}>
            <Spin />
          </Flex>
        ) : chartError ? (
          <Alert message="Error" description={chartError} type="error" />
        ) : chartData?.data && chartData.data.length > 0 ? (
          <>
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...chartData.data].reverse()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(val) => dayjs(val).format('MM/DD HH:mm')}
                    minTickGap={30}
                  />
                  <YAxis label={{ value: chartData.uom, angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    labelFormatter={(label) => dayjs(label).format('MMM D, YYYY h:mm A')}
                    formatter={(value: number) => [value.toFixed(2), chartData.uom]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#1890ff"
                    name={selectedTag?.Name || 'Value'}
                    dot={false}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <Text type="secondary" style={{ display: 'block', marginTop: '16px', fontSize: '12px', textAlign: 'center' }}>
              Success: Loaded {chartData.count} data points from <Text code>{chartData.tableName}</Text>.
            </Text>
          </>
        ) : (
          <Alert
            message="No data found"
            description={
              <>
                No data found for this tag in the selected range (Default: Last 30 days).
                <br />
                Technical Info: Fact Table <Text code>{selectedTag?.F_tablename}</Text> might be empty or data is older than configured window.
              </>
            }
            type="info"
            style={{ marginTop: '16px' }}
          />
        )}
      </Modal>
    </div>
  );
};
