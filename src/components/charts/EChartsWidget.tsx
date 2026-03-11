import React, { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import {
  LineChart,
  BarChart,
  ScatterChart,
  PieChart,
  HeatmapChart,
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
  VisualMapComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type {
  WidgetConfiguration,
  SelectedDataPoint,
  SeriesDataMap,
} from '@/types/widget';
import { theme } from 'antd';

// Register ECharts modules
echarts.use([
  LineChart,
  BarChart,
  ScatterChart,
  PieChart,
  HeatmapChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LegendComponent,
  ToolboxComponent,
  MarkLineComponent,
  MarkPointComponent,
  VisualMapComponent,
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
  const { token } = theme.useToken();

  const option = useMemo(() => {
    const { dataPoints, chart, scales, comparison } = config;

    if (dataPoints.length === 0) return {};

    //  Special Cases Logic 

    // 1. Comparing Categories
    if (chart.relationship === 'comparing-categories') {
      const dpXList = dataPoints.filter(dp => dp.axis === 'x');
      const dpYList = dataPoints.filter(dp => !dp.axis || dp.axis === 'y');
      if (dpXList.length === 0 || dpYList.length === 0) {
        return { title: { text: 'Select at least 1 X-axis point and 1 Y-axis point', left: 'center', top: 'middle' }};
      }
      const dpX = dpXList[0];
      const xData = data[dpX.code] || [];
      const series: any[] = [];
      dpYList.forEach(dpY => {
        const yData = data[dpY.code] || [];
        const pairedData = xData.map((d, i) => [d.value, yData[i]?.value || 0]);
        series.push({
          name: dpY.name,
          type: chart.type === 'bar' ? 'bar' : 'scatter',
          symbolSize: (chart.scatterPointMinSize || 4) * 2,
          itemStyle: { color: dpY.color },
          data: pairedData,
        });
      });
      return {
        backgroundColor: 'transparent',
        grid: { top: 48, right: 30, bottom: 48, left: 48, containLabel: true },
        tooltip: { trigger: 'item', axisPointer: { type: 'cross' } },
        legend: { show: true, top: 4 },
        xAxis: {
          type: scales.scaleType === 'log' ? 'log' : 'value',
          name: dpX.name,
          nameLocation: 'middle',
          nameGap: 30,
          scale: true,
        },
        yAxis: {
          type: scales.scaleType === 'log' ? 'log' : 'value',
          name: dpYList.length === 1 ? dpYList[0].name : '',
          scale: true,
        },
        series,
      };
    }

    // 2. Part-of-whole Pie
    if (chart.relationship === 'part-of-whole' && chart.type === 'pie') {
      const pieData = dataPoints.map(dp => {
        const dpData = data[dp.code] || [];
        const lastValue = dpData.length > 0 ? dpData[dpData.length - 1].value : 0;
        return { name: dp.name, value: lastValue, itemStyle: { color: dp.color } };
      });

      return {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item' },
        legend: { show: true, bottom: 0, type: 'scroll' },
        series: [{
          type: 'pie',
          radius: chart.pieLayout === 'donut' ? ['40%', '70%'] : '70%',
          data: pieData,
          label: { show: chart.showDataLabels, formatter: '{b}: {c} ({d}%)' }
        }]
      };
    }

    // 3. Heatmap
    if (chart.type === 'heatmap') {
       // Mock heatmap dataset representing hours vs days for the first point
       const mockHeatmapData = [];
       for (let i = 0; i < 7; i++) {
         for (let j = 0; j < 24; j++) {
           mockHeatmapData.push([j, i, Math.floor(Math.random() * 100)]);
         }
       }
       return {
         backgroundColor: 'transparent',
         tooltip: { position: 'top' },
         grid: { height: '60%', top: '10%' },
         xAxis: { type: 'category', data: Array.from({length: 24}, (_, i) => `${i}:00`), splitArea: { show: true } },
         yAxis: { type: 'category', data: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], splitArea: { show: true } },
         visualMap: { min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: '0%' },
         series: [{
           name: dataPoints[0]?.name || 'Value',
           type: 'heatmap',
           data: mockHeatmapData,
           label: { show: chart.showDataLabels },
           emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
         }]
       };
    }

    //  Standard Time-Series Logic 
    
    const isMultiPeriodBar = chart.type === 'bar' && comparison.enabled;

    const buildSeries = (dp: SelectedDataPoint) => {
      const seriesData = data[dp.code] || [];
      const base: any = {
        name: isMultiPeriodBar ? `${dp.name} (Target)` : dp.name || dp.code,
        data: seriesData.map((d) => [d.timestamp, d.value]),        
        yAxisIndex: comparison.enabled && comparison.mode === 'dual-axis' && !isMultiPeriodBar ? dp.axisIndex : 0,
        smooth: true,
        showSymbol: false,
        label: {
          show: chart.showDataLabels,
          position: 'top'
        }
      };

      const items = [];

      switch (chart.type) {
        case 'line':
          items.push({ ...base, type: 'line', lineStyle: { width: chart.lineWidth, color: dp.color }, itemStyle: { color: dp.color } });
          break;
        case 'area':
          items.push({ ...base, type: 'line', lineStyle: { width: chart.lineWidth, color: dp.color }, itemStyle: { color: dp.color }, areaStyle: { color: dp.color, opacity: chart.fillOpacity / 100 } });
          break;
        case 'bar':
          items.push({ ...base, type: 'bar', itemStyle: { color: dp.color, borderRadius: [4, 4, 0, 0] }, stack: chart.barLayout === 'stacked' ? 'target' : undefined });
          break;
        default:
          items.push({ ...base, type: 'line' });
      }

      // Automatically add Baseline Series for single-point comparisons on Bar/Line if enabled
      if (isMultiPeriodBar) {
        const baselineData = seriesData.map(d => {
          return [d.timestamp, d.value * 0.8]; // Mock baseline value mapped dynamically natively
        });
        
        items.push({
           ...base,
           name: `${dp.name} (Baseline)`,
           data: baselineData,
           type: 'bar',
           itemStyle: { color: token.colorTextDisabled, borderRadius: [4, 4, 0, 0] },
           stack: chart.barLayout === 'stacked' ? 'baseline' : undefined
        });
      }

      return items;
    };

    const series = dataPoints.flatMap(buildSeries);

    const yAxes: any[] = [
      {
        type: scales.scaleType === 'log' ? 'log' : 'value',
        name: dataPoints[0]?.uom || '',
        nameTextStyle: { color: token.colorTextSecondary, fontSize: 11 },
        axisLabel: {
          color: token.colorTextSecondary,
          fontSize: 11,
          formatter: (val: number) => val.toFixed(scales.precision),
        },
        splitLine: {
          show: chart.showGridLines,
          lineStyle: { color: token.colorBorder, type: 'dashed' },
        },
        ...(scales.yAxisMode === 'manual' && scales.yMin !== undefined ? { min: scales.yMin } : {}),
        ...(scales.yAxisMode === 'manual' && scales.yMax !== undefined ? { max: scales.yMax } : {}),
        show: scales.showPriceScale,
      },
    ];

    if (comparison.enabled && comparison.mode === 'dual-axis' && dataPoints.length > 1 && !isMultiPeriodBar) {
      yAxes.push({
        type: scales.scaleType === 'log' ? 'log' : 'value',
        name: dataPoints[1]?.uom || '',
        nameTextStyle: { color: token.colorTextSecondary, fontSize: 11 },
        axisLabel: { color: token.colorTextSecondary, fontSize: 11 },
        splitLine: { show: false },
        position: 'right',
      });
    }

    return {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 500,
      grid: {
        top: 48,
        right: comparison.enabled && comparison.mode === 'dual-axis' ? 70 : 24,
        bottom: 72,
        left: 36,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: token.colorBgContainer,
        borderColor: token.colorBorder,
        borderWidth: 1,
        textStyle: { color: token.colorText, fontSize: 12 },
        axisPointer: { type: 'cross' },
      },
      legend: {
        show: series.length > 1,
        top: 4,
        textStyle: { color: token.colorTextSecondary, fontSize: 12 },
        icon: 'roundRect',
      },
      toolbox: {
        show: true,
        right: 16,
        top: 4,
        feature: {
          dataZoom: { yAxisIndex: 'none', title: { zoom: 'Zoom', back: 'Reset' } },
          restore: { title: 'Reset' },
        },
        iconStyle: { borderColor: token.colorTextSecondary },
      },
      xAxis: {
        type: chart.barLayout === 'horizontal' ? 'value' : 'time',
        axisLabel: { color: token.colorTextSecondary, fontSize: 11 },
        axisLine: { lineStyle: { color: token.colorBorder } },
        splitLine: { show: chart.barLayout === 'horizontal' },
        ...(scales.xAxisMode === 'manual' && scales.xMin !== undefined ? { min: scales.xMin } : {}),
        ...(scales.xAxisMode === 'manual' && scales.xMax !== undefined ? { max: scales.xMax } : {}),
      },
      yAxis: chart.barLayout === 'horizontal' ? { ...yAxes[0], type: 'category', data: series[0]?.data.map((d: any) => new Date(d[0]).toLocaleDateString()) || [] } : yAxes,
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        {
          type: 'slider',
          start: 0,
          end: 100,
          height: 24,
          bottom: 8,
          borderColor: token.colorBorder,
          backgroundColor: token.colorFillQuaternary,
          fillerColor: `${token.colorPrimary}20`,
          handleStyle: { color: token.colorPrimary },
          textStyle: { color: token.colorTextSecondary, fontSize: 10 },
        },
      ],
      series,
    };
  }, [config, data, token]);

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
