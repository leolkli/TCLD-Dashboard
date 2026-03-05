import React, { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import {
  LineChart,
  BarChart,
  ScatterChart,
  CandlestickChart,
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LegendComponent,
  ToolboxComponent,
  MarkLineComponent,
  MarkPointComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type {
  WidgetConfiguration,
  SelectedDataPoint,
  SeriesDataMap,
} from '@/types/widget';
import { useTheme } from '@mui/material/styles';

// Register ECharts modules
echarts.use([
  LineChart,
  BarChart,
  ScatterChart,
  CandlestickChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LegendComponent,
  ToolboxComponent,
  MarkLineComponent,
  MarkPointComponent,
  CanvasRenderer,
]);

interface EChartsWidgetProps {
  config: WidgetConfiguration;
  data: SeriesDataMap;
  height?: string | number;
}

export const EChartsWidget: React.FC<EChartsWidgetProps> = ({
  config,
  data,
  height = '100%',
}) => {
  const muiTheme = useTheme();

  const option = useMemo(() => {
    const { dataPoints, chart, scales, comparison } = config;

    if (dataPoints.length === 0) return {};

    // ─── Build series ────────────────────────────────────
    const buildSeries = (dp: SelectedDataPoint) => {
      const seriesData = data[dp.code] || [];
      const base: any = {
        name: dp.name || dp.code,
        data: seriesData.map((d) => [d.timestamp, d.value]),
        yAxisIndex: comparison.enabled && comparison.mode === 'dual-axis' ? dp.axisIndex : 0,
        smooth: true,
        symbolSize: chart.type === 'scatter' ? 6 : 0,
        showSymbol: chart.type === 'scatter',
      };

      switch (chart.type) {
        case 'line':
          return {
            ...base,
            type: 'line',
            lineStyle: { width: chart.lineWidth, color: dp.color },
            itemStyle: { color: dp.color },
          };
        case 'area':
          return {
            ...base,
            type: 'line',
            lineStyle: { width: chart.lineWidth, color: dp.color },
            itemStyle: { color: dp.color },
            areaStyle: { color: dp.color, opacity: chart.fillOpacity / 100 },
          };
        case 'bar':
          return {
            ...base,
            type: 'bar',
            itemStyle: { color: dp.color, borderRadius: [4, 4, 0, 0] },
          };
        case 'candlestick':
          // Candlestick needs [open, close, low, high] — for meter data we fake:
          // open=value, close=value, low=value*0.98, high=value*1.02
          return {
            ...base,
            type: 'candlestick',
            data: seriesData.map((d) => [
              d.timestamp,
              d.value,
              d.value,
              d.value * 0.98,
              d.value * 1.02,
            ]),
            itemStyle: {
              color: chart.upColor,
              color0: chart.downColor,
              borderColor: chart.upColor,
              borderColor0: chart.downColor,
            },
          };
        case 'scatter':
          return {
            ...base,
            type: 'scatter',
            itemStyle: { color: dp.color },
          };
        default:
          return { ...base, type: 'line' };
      }
    };

    const series = dataPoints.map(buildSeries);

    // ─── Y-Axes ──────────────────────────────────────────
    const yAxes: any[] = [
      {
        type: scales.scaleType === 'log' ? 'log' : 'value',
        name: dataPoints[0]?.uom || '',
        nameTextStyle: { color: muiTheme.palette.text.secondary, fontSize: 11 },
        axisLabel: {
          color: muiTheme.palette.text.secondary,
          fontSize: 11,
          formatter: (val: number) => val.toFixed(scales.precision),
        },
        splitLine: {
          show: chart.showGridLines,
          lineStyle: { color: muiTheme.palette.divider, type: 'dashed' },
        },
        ...(scales.yAxisMode === 'manual' && scales.yMin !== undefined ? { min: scales.yMin } : {}),
        ...(scales.yAxisMode === 'manual' && scales.yMax !== undefined ? { max: scales.yMax } : {}),
        show: scales.showPriceScale,
      },
    ];

    // Dual axis for comparison
    if (comparison.enabled && comparison.mode === 'dual-axis' && dataPoints.length > 1) {
      yAxes.push({
        type: scales.scaleType === 'log' ? 'log' : 'value',
        name: dataPoints[1]?.uom || '',
        nameTextStyle: { color: muiTheme.palette.text.secondary, fontSize: 11 },
        axisLabel: { color: muiTheme.palette.text.secondary, fontSize: 11 },
        splitLine: { show: false },
        position: 'right',
      });
    }

    // ─── Assemble option ─────────────────────────────────
    return {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 500,
      grid: {
        top: 48,
        right: comparison.enabled && comparison.mode === 'dual-axis' ? 70 : 24,
        bottom: 72,
        left: 16,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: muiTheme.palette.background.paper,
        borderColor: muiTheme.palette.divider,
        borderWidth: 1,
        textStyle: {
          color: muiTheme.palette.text.primary,
          fontSize: 12,
        },
        axisPointer: { type: 'cross' },
      },
      legend: {
        show: dataPoints.length > 1,
        top: 4,
        textStyle: { color: muiTheme.palette.text.secondary, fontSize: 12 },
        icon: 'roundRect',
        itemWidth: 14,
        itemHeight: 8,
      },
      toolbox: {
        show: true,
        right: 16,
        top: 4,
        feature: {
          dataZoom: { yAxisIndex: 'none', title: { zoom: 'Zoom', back: 'Reset' } },
          restore: { title: 'Reset' },
        },
        iconStyle: { borderColor: muiTheme.palette.text.secondary },
      },
      xAxis: {
        type: 'time',
        axisLabel: { color: muiTheme.palette.text.secondary, fontSize: 11 },
        axisLine: { lineStyle: { color: muiTheme.palette.divider } },
        splitLine: { show: false },
      },
      yAxis: yAxes,
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          type: 'slider',
          start: 0,
          end: 100,
          height: 24,
          bottom: 8,
          borderColor: muiTheme.palette.divider,
          backgroundColor: muiTheme.palette.grey[100],
          fillerColor: `${muiTheme.palette.primary.main}20`,
          handleStyle: { color: muiTheme.palette.primary.main },
          textStyle: { color: muiTheme.palette.text.secondary, fontSize: 10 },
        },
      ],
      series,
    };
  }, [config, data, muiTheme]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height: height || '100%', width: '100%' }}
      notMerge
      lazyUpdate
      opts={{ renderer: 'canvas' }}
    />
  );
};
