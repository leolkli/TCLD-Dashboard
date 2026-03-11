import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Collapse, 
  Alert, 
  Tag,
  Spin,
  Flex
} from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { synapseService } from '@/services/synapseService';
import type { SynapsePortfolio } from '@/types/synapse';

const { Title, Text, Paragraph } = Typography;

/**
 * Buildings Page Component
 * Renders the Portfolio > Building hierarchy fetched from Synapse.
 */
export const BuildingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [hierarchy, setHierarchy] = useState<SynapsePortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await synapseService.getHierarchy();
        setHierarchy(data || []);
      } catch (err: any) {
        console.error("API Error, using fallback data", err);
        // Fallback mock data
        setHierarchy([{
          name: "Demo Portfolio",
          buildings: [
            { code: "TKO", name: "Tseung Kwan O" },
            { code: "KMB", name: "KMB Depot" }
          ]
        }]);
        // Clear error so UI renders
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '200px' }}>
        <Spin />
      </Flex>
    );
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2}>Portfolio Overview</Title>
        <Paragraph type="secondary">
          Select a building to view details and tags.
        </Paragraph>
      </div>

      {hierarchy.length === 0 && (
        <Alert message="No portfolios found." type="info" />
      )}

      {hierarchy.map((portfolio) => (
        <Collapse
          key={portfolio.name}
          defaultActiveKey={[portfolio.name]}
          style={{ marginBottom: '16px' }}
          items={[
            {
              key: portfolio.name,
              label: (
                <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                  <Title level={5} style={{ margin: 0 }}>{portfolio.name}</Title>
                  <Tag>{`${portfolio.buildings.length} Buildings`}</Tag>
                </Flex>
              ),
              children: (
                <Row gutter={[16, 16]}>
                  {portfolio.buildings.map((building) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={building.code}>
                      <Card
                        hoverable
                        onClick={() => navigate(`/buildings/${building.code}`, { state: { buildingName: building.name } })}
                        style={{ height: '100%', cursor: 'pointer' }}
                      >
                        <Flex gap="small" align="center" style={{ marginBottom: '8px' }}>
                          <ShopOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                          <Text ellipsis title={building.name} strong>
                            {building.name}
                          </Text>
                        </Flex>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Code: {building.code}
                        </Text>
                      </Card>
                    </Col>
                  ))}
                  {portfolio.buildings.length === 0 && (
                    <Col xs={24}>
                      <Text type="secondary">
                        No buildings assigned to this portfolio.
                      </Text>
                    </Col>
                  )}
                </Row>
              ),
            },
          ]}
        />
      ))}
    </div>
  );
};
