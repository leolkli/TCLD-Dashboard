import React from 'react';
import { Skeleton, Alert, Tag, Tooltip, Button, Typography, Flex, theme } from 'antd';
import {
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { EChartsWidget } from './EChartsWidget';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';

const { Text, Title } = Typography;

export const ChartPreview: React.FC = () => {
  const { config, previewData, isLoading, error, fetchPreviewData } =
    useWidgetConfigStore();
  const { token } = theme.useToken();

  const { dataPoints, header, chart } = config;
  const hasData = dataPoints.length > 0 && Object.keys(previewData).length > 0;

  const lastValueInfo = React.useMemo(() => {
    if (!hasData || !dataPoints[0]) return null;
    const series = previewData[dataPoints[0].code];
    if (!series || series.length < 2) return null;
    const last = series[series.length - 1].value;
    const prev = series[series.length - 2].value;
    const change = last - prev;
    const changePct = prev !== 0 ? (change / prev) * 100 : 0;
    return { last, change, changePct, uom: dataPoints[0].uom };
  }, [hasData, previewData, dataPoints]);

  return (
    <Flex
      vertical
      style={{
        height: '100%',
        backgroundColor: chart.backgroundColor || token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        overflow: 'hidden',
      }}
    >
      {header.visible && (
        <Flex
          align="flex-start"
          justify="space-between"
          style={{
            padding: '16px 20px 8px 20px',
          }}
        >
          <div>
            <Title
              level={
                header.fontSize === 'large'
                  ? 4
                  : header.fontSize === 'small'
                    ? 5
                    : 5
              }
              style={{ margin: 0, fontWeight: 600, color: token.colorText }}
              ellipsis
            >
              {config.general.title || 'Untitled Widget'}
            </Title>

            {dataPoints.length > 0 && (
              <Flex wrap="wrap" gap="4px" style={{ marginTop: 4 }}>
                {dataPoints.map((dp) => (
                  <Tag
                    key={dp.code}
                    color={dp.color}
                    style={{
                      margin: 0,
                      fontWeight: 500,
                      fontSize: '0.7rem',
                      lineHeight: '20px',
                    }}
                  >
                    {dp.name || dp.code}
                  </Tag>
                ))}
              </Flex>
            )}

            {header.showLastValue && lastValueInfo && (
              <Flex align="center" gap={8} style={{ marginTop: 4 }}>
                <Text strong style={{ fontSize: 20, color: token.colorText }}>
                  {lastValueInfo.last.toLocaleString(undefined, {
                    maximumFractionDigits: config.scales.precision,
                  })}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {lastValueInfo.uom}
                </Text>
                {header.showChangePercent && (
                  <Tag
                    icon={
                      lastValueInfo.change >= 0 ? (
                        <ArrowUpOutlined />
                      ) : (
                        <ArrowDownOutlined />
                      )
                    }
                    color={lastValueInfo.change >= 0 ? 'success' : 'error'}
                    style={{ fontWeight: 600, fontSize: '0.7rem', margin: 0 }}
                  >
                    {lastValueInfo.changePct >= 0 ? '+' : ''}
                    {lastValueInfo.changePct.toFixed(2)}%
                  </Tag>
                )}
              </Flex>
            )}
          </div>

          <Tooltip title="Refresh data">
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              onClick={fetchPreviewData}
              disabled={isLoading || dataPoints.length === 0}
              style={{ color: token.colorTextSecondary }}
            />
          </Tooltip>
        </Flex>
      )}

      <div style={{ flex: 1, minHeight: 0, position: 'relative', padding: '0 8px 8px 8px' }}>
        {isLoading && (
          <div style={{ padding: 16, height: '100%' }}>
            <Skeleton.Node active style={{ width: '100%', height: '100%', borderRadius: token.borderRadiusLG }} />
          </div>
        )}

        {error && (
          <Alert type="error" message={error} style={{ margin: 16 }} />
        )}

        {!isLoading && !error && dataPoints.length === 0 && (
          <Flex
            vertical
            align="center"
            justify="center"
            gap={8}
            style={{
              height: '100%',
              color: token.colorTextSecondary,
            }}
          >
            <Title level={5} style={{ color: token.colorTextDisabled, margin: 0 }}>
              No Data Points Selected
            </Title>
            <Text style={{ color: token.colorTextDisabled }}>
              Use the Data Points panel to search and add tags
            </Text>
          </Flex>
        )}

        {!isLoading && !error && hasData && (
          <EChartsWidget config={config} data={previewData} height="100%" />
        )}

        {!isLoading && !error && dataPoints.length > 0 && !hasData && (
          <Flex
            align="center"
            justify="center"
            style={{
              height: '100%',
              color: token.colorTextSecondary,
            }}
          >
            <Text style={{ color: token.colorTextDisabled }}>
              No readings available for selected tags and date range
            </Text>
          </Flex>
        )}
      </div>
    </Flex>
  );
};
