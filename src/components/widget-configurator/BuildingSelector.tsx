import React, { useEffect, useState } from 'react';
import { Flex, Select, Typography, Tag, Radio } from 'antd';
import { BankOutlined, ApartmentOutlined } from '@ant-design/icons';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import { synapseService } from '@/services/synapseService';
import type { WidgetScope } from '@/types/widget';

interface PortfolioOption {
  name: string;
}

export const BuildingSelector: React.FC = () => {
  const { config, buildings, setBuilding, setPortfolio, fetchBuildings } = useWidgetConfigStore();
  const [portfolios, setPortfolios] = useState<PortfolioOption[]>([]);

  useEffect(() => {
    if (buildings.length === 0) {
      fetchBuildings();
    }
  }, [buildings.length, fetchBuildings]);

  useEffect(() => {
    const loadPortfolios = async () => {
      try {
        const hierarchy = await synapseService.getHierarchy();
        setPortfolios(hierarchy.map((p) => ({ name: p.name })));
      } catch {
        setPortfolios([]);
      }
    };
    loadPortfolios();
  }, []);

  const scope: WidgetScope = config.widgetScope || 'building';

  const handleScopeChange = (e: any) => {
    const value = e.target.value;
    if (value === 'building') {
      setBuilding('', '');
    } else {
      setPortfolio('');
    }
  };

  const handleBuildingChange = (value: string | undefined, option: any) => {
    if (value && option) {
      setBuilding(value, option.label);
    } else {
      setBuilding('', '');
    }
  };

  const handlePortfolioChange = (value: string | undefined) => {
    setPortfolio(value || '');
  };

  return (
    <Flex vertical gap="middle">
      <div>
        <Typography.Text type="secondary" style={{ marginBottom: 4, display: 'block', fontSize: 12 }}>
          Widget Scope
        </Typography.Text>
        <Radio.Group value={scope} onChange={handleScopeChange} style={{ width: '100%' }}>
          <Radio.Button value="building" style={{ width: '50%', textAlign: 'center' }}>
            <BankOutlined style={{ marginRight: 4 }} /> Building
          </Radio.Button>
          <Radio.Button value="portfolio" style={{ width: '50%', textAlign: 'center' }}>
            <ApartmentOutlined style={{ marginRight: 4 }} /> Portfolio
          </Radio.Button>
        </Radio.Group>
      </div>

      {scope === 'building' && (
        <>
          <Select
            allowClear
            showSearch
            placeholder="Search buildings..."
            value={config.buildingCode || undefined}
            onChange={handleBuildingChange}
            options={buildings.map(b => ({
              value: b.code,
              label: b.name
            }))}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase()) ||
              (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
            }
            style={{ width: '100%' }}
          />

          {config.buildingCode && (
            <div>
              <Tag icon={<BankOutlined />} color="blue" closable onClose={() => setBuilding('', '')}>
                {config.buildingName} — {config.buildingCode}
              </Tag>
            </div>
          )}

          {!config.buildingCode && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Select a building to scope tag search and attach this widget.
            </Typography.Text>
          )}
        </>
      )}

      {scope === 'portfolio' && (
        <>
          <Select
            allowClear
            showSearch
            placeholder="Search portfolios..."
            value={config.portfolioName || undefined}
            onChange={handlePortfolioChange}
            options={portfolios.map(p => ({
              value: p.name,
              label: p.name
            }))}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            style={{ width: '100%' }}
          />

          {config.portfolioName && (
            <div>
              <Tag icon={<ApartmentOutlined />} color="purple" closable onClose={() => setPortfolio('')}>
                {config.portfolioName}
              </Tag>
            </div>
          )}

          {!config.portfolioName && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Select a portfolio. Tags from all buildings in the portfolio will be available.
            </Typography.Text>
          )}
        </>
      )}
    </Flex>
  );
};
