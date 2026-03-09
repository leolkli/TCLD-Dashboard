import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { WidgetContainer } from './WidgetContainer';
import { EChartsWidget } from '../charts/EChartsWidget';
import { KPIWidget } from './KPIWidget';
import type { WidgetConfiguration, SeriesDataMap } from '@/types/widget';
import { useDashboardGlobalStore, GlobalFilters } from '@/store/dashboardGlobalStore';
import { synapseService } from '@/services/synapseService';

const calculateDateRange = (filter: GlobalFilters['dateRange']) => {
  const now = dayjs();
  let start = now;
  switch (filter.preset) {
    case '1D': start = now.subtract(1, 'day'); break;
    case '1W': start = now.subtract(1, 'week'); break;
    case '1M': start = now.subtract(1, 'month'); break;
    case '3M': start = now.subtract(3, 'months'); break;
    case '6M': start = now.subtract(6, 'months'); break;
    case '1Y': start = now.subtract(1, 'year'); break;
    case 'ALL': start = now.subtract(5, 'years'); break;
    case 'custom':
      return {
        startDate: filter.customStart || now.subtract(1, 'month').toISOString(),
        endDate: filter.customEnd || now.toISOString(),
      };
  }
  return { startDate: start.toISOString(), endDate: now.toISOString() };
};

interface DashboardWidgetLoaderProps {
  layoutId: string;
  config: WidgetConfiguration;
  isEditMode: boolean;
  onRemove: (layoutId: string) => void;
}

export const DashboardWidgetLoader: React.FC<DashboardWidgetLoaderProps> = ({
  layoutId,
  config,
  isEditMode,
  onRemove,
}) => {
  const globalFilters = useDashboardGlobalStore((state) => state.globalFilters);
  const setEditingWidgetId = useDashboardGlobalStore((state) => state.setEditingWidgetId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<SeriesDataMap>({});

  // ─── Data Fetching Logic ──────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = calculateDateRange(globalFilters.dateRange);
      const codes = config.dataPoints.map(dp => dp.code);

      if (codes.length === 0) {
        setData({});
        setLoading(false);
        return;
      }

      // Fetch from API
      const response = await synapseService.getMultiReadings(codes, startDate, endDate);
      
      // Transform MultiSeriesResponse into SeriesDataMap correctly formatted for ECharts
      const newMap: SeriesDataMap = {};
      response.series.forEach(s => {
        newMap[s.code] = s.data;
      });

      setData(newMap);
    } catch (err: any) {
      setError(new Error(err?.message || 'Failed to fetch widget data'));
    } finally {
      setLoading(false);
    }
  };

  // Triggers re-fetch when global date range changes
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalFilters.dateRange.preset, globalFilters.dateRange.customStart, globalFilters.dateRange.customEnd]);

  // Handle local widget actions
  const handleRefresh = () => fetchData();
  const handleEdit = () => {
    if (config.id) {
      setEditingWidgetId(config.id);
    } else {
      console.warn('Cannot edit widget without an ID');
    }
  };
  const handleExpand = () => console.log('Expand Widget', layoutId);

  // Derive KPI values if applicable
  const getKpiValues = () => {
    if (config.chart?.type !== 'kpi' || config.dataPoints.length === 0) {
      return { current: 0, previous: 0 };
    }
    const series = data[config.dataPoints[0].code];
    if (!series || series.length === 0) return { current: 0, previous: 0 };
    
    const current = series[series.length - 1].value;
    const previous = series.length > 1 ? series[series.length - 2].value : 0;
    return { current, previous };
  };

  const { current: kpiCurrent, previous: kpiPrevious } = getKpiValues();

  return (
    <WidgetContainer
      config={config}
      isLoading={loading}
      error={error}
      onRefresh={handleRefresh}
      onExpand={handleExpand}
      onEdit={isEditMode ? handleEdit : undefined}
      onRemove={isEditMode ? () => onRemove(layoutId) : undefined}
    >
      {config.chart?.type === 'kpi' ? (
        <KPIWidget
          title={config.name}
          value={kpiCurrent}
          previousValue={kpiPrevious}
          format={config.dataPoints?.[0]?.uom === 'USD' ? 'currency' : 'number'}
          color={config.dataPoints?.[0]?.color}
        />
      ) : (
        <EChartsWidget config={config} data={data} />
      )}
    </WidgetContainer>
  );
};
