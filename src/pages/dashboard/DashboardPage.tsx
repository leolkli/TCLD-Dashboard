import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Tag,
  Statistic,
  Flex
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  DollarOutlined,
  ShopOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { synapseService } from '../../services/synapseService';
import { chartColors } from '../../theme';

const { Title, Paragraph, Text } = Typography;

// Mock trend data
const trendData = [
  { name: 'Mon', usage: 4000 },
  { name: 'Tue', usage: 3000 },
  { name: 'Wed', usage: 2000 },
  { name: 'Thu', usage: 2780 },
  { name: 'Fri', usage: 1890 },
  { name: 'Sat', usage: 2390 },
  { name: 'Sun', usage: 3490 },
];

const COLORS = chartColors.primary;

const pieData = [
  { name: 'HVAC', value: 400 },
  { name: 'Lighting', value: 300 },
  { name: 'Equipment', value: 300 },
  { name: 'Other', value: 200 },
];

/**
 * Dashboard Page Component
 * Main overview dashboard with KPIs and charts
 */
export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [buildingCount, setBuildingCount] = useState(0);
  const [buildingsData, setBuildingsData] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch real building hierarchy (with fallback)
        let hierarchy;
        try {
          hierarchy = await synapseService.getHierarchy();
        } catch (e) {
          console.warn("API failed, using mock data");
          hierarchy = [{ buildings: [{ code: "TKO", name: "Tseung Kwan O" }, { code: "KMB", name: "KMB" }] }];
        }

        // Calculate total buildings (flatten portfolios)
        const buildings = hierarchy.flatMap(p => p.buildings);
        setBuildingCount(buildings.length);

        // Prepare comparison data using REAL building names
        const comparisonData = buildings.map(b => ({
          name: b.code,
          value: Math.floor(Math.random() * 5000) + 1000 // Mock value for now
        })).slice(0, 10); // Limit to top 10 for display

        setBuildingsData(comparisonData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Dynamic KPIs based on real counts
  const kpis = [
    {
      title: 'Active Buildings',
      value: buildingCount.toString(),
      unit: 'Site(s)',
      change: 0,
      icon: ShopOutlined,
      color: '#667eea',
    },
    {
      title: 'Total Energy (Est)',
      value: '45,230',
      unit: 'kWh',
      change: -5.2,
      icon: ThunderboltOutlined,
      color: '#3b82f6',
    },
    {
      title: 'Water Usage',
      value: '1,205',
      unit: 'm³',
      change: 2.1,
      icon: ExperimentOutlined,
      color: '#06b6d4',
    },
    {
      title: 'Monthly Cost (Proj)',
      value: '$12,345',
      unit: '',
      change: -3.8,
      icon: DollarOutlined,
      color: '#10b981',
    },
  ];

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '200px' }}>
        <Spin />
      </Flex>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ margin: 0, marginBottom: '8px' }}>
          Energy Dashboard
        </Title>
        <Paragraph type="secondary" style={{ margin: 0 }}>
          Overview of {buildingCount} monitored facilities across the portfolio.
        </Paragraph>
      </div>

      {/* KPI Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Col xs={24} sm={12} lg={6} key={kpi.title}>
              <Card hoverable style={{ height: '100%' }}>
                <Flex justify="space-between" align="flex-start">
                  <Flex vertical gap="small" flex={1}>
                    <Text type="secondary">{kpi.title}</Text>
                    <Statistic
                      value={kpi.value}
                      suffix={kpi.unit}
                      styles={{ content: { color: 'inherit', fontSize: '28px', fontWeight: 700 } }}
                    />
                    <Flex align="center" gap="small">
                      {kpi.change !== 0 && (
                        <>
                          {kpi.change < 0 ? (
                            <ArrowDownOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
                          ) : (
                            <ArrowUpOutlined style={{ color: '#ff4d4f', fontSize: '14px' }} />
                          )}
                          <Text
                            type={kpi.change < 0 ? 'success' : 'danger'}
                            style={{ fontSize: '12px', fontWeight: 500 }}
                          >
                            {Math.abs(kpi.change)}% vs last period
                          </Text>
                        </>
                      )}
                      {kpi.change === 0 && <Tag>Stable</Tag>}
                    </Flex>
                  </Flex>
                  <Flex
                    justify="center"
                    align="center"
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: `${kpi.color}15`,
                      minWidth: '48px',
                    }}
                  >
                    <Icon style={{ color: kpi.color, fontSize: '24px' }} />
                  </Flex>
                </Flex>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Charts Section */}
      <Row gutter={[24, 24]}>
        {/* Main Chart */}
        <Col xs={24} lg={16}>
          <Card>
            <Title level={5} style={{ marginBottom: '16px' }}>
              Portfolio Consumption Trend (Last 7 Days)
            </Title>
            <div style={{ height: '320px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="usage" stroke="#8884d8" name="Energy (kWh)" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Side Chart */}
        <Col xs={24} lg={8}>
          <Card>
            <Title level={5} style={{ marginBottom: '16px' }}>
              Consumption by Type
            </Title>
            <div style={{ height: '320px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Buildings Comparison */}
        <Col xs={24}>
          <Card>
            <Title level={5} style={{ marginBottom: '16px' }}>
              Top Buildings by Energy Usage (Mock Data / Live Names)
            </Title>
            <div style={{ height: '320px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buildingsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Energy (kWh)" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
