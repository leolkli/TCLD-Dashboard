import React from 'react';
import { Flex, Switch, Typography, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import type { DateRangePreset } from '@/types/widget';

const { RangePicker } = DatePicker;

const PRESETS: { label: string; value: DateRangePreset }[] = [
  { label: '1 Day', value: '1D' },
  { label: '1 Week', value: '1W' },
  { label: '1 Month', value: '1M' },
  { label: '3 Months', value: '3M' },
  { label: '6 Months', value: '6M' },
  { label: '1 Year', value: '1Y' },
  { label: 'All Time', value: 'ALL' },
  { label: 'Custom', value: 'custom' },
];

const getBaselinePresetsForTarget = (targetPreset: DateRangePreset | null): { label: string; value: DateRangePreset }[] => {
  if (targetPreset === 'custom') {
    return [
      { label: 'Same Duration, Previous Period', value: 'custom' },
      { label: 'Same Dates, Previous Year', value: '1Y' }
    ];
  }
  if (!targetPreset || targetPreset === 'ALL') return PRESETS;
  const options: { label: string; value: DateRangePreset }[] = [];
  options.push({ label: `Previous ${targetPreset.replace('1', '').replace('D', 'Day').replace('W', 'Week').replace('M', 'Month').replace('Y', 'Year')}`, value: targetPreset });
  if (targetPreset !== '1Y') {
    options.push({ label: 'Last Year Same Period', value: '1Y' });
  }
  return [...options, ...PRESETS.filter(p => p.value !== targetPreset && p.value !== '1Y')];
};

export const ComparisonSettings: React.FC = () => {
  const { config, updateComparison, updateComparisonBaseline, updateComparisonTarget } = useWidgetConfigStore();
  const { comparison } = config;

  const handleTargetPresetChange = (preset: DateRangePreset) => {
    updateComparisonTarget({ preset });
    if (preset !== 'custom' && comparison.baseline.preset === 'custom') {
      updateComparisonBaseline({ preset: preset });
    }
  };

  return (
    <Flex vertical gap="middle">
      <div>
        <Switch
          checked={comparison.enabled}
          onChange={(checked) => {
            updateComparison({ enabled: checked });
            if (checked) {
              updateComparisonTarget({ enabled: true });
              updateComparisonBaseline({ enabled: true });
            }
          }}
        />
        <span style={{ marginLeft: 8 }}>Enable Period Comparison</span>
      </div>

      {comparison.enabled && (
        <Flex vertical gap="middle" style={{ marginTop: 8, padding: 16, backgroundColor: '#fafafa', borderRadius: 8 }}>
          <div>
            <Typography.Text type="secondary" style={{ marginBottom: 4, display: 'block', fontSize: 12 }}>
              Target Period (Primary)
            </Typography.Text>
            <Select
              style={{ width: '100%' }}
              value={comparison.target.preset || '1M'}
              onChange={handleTargetPresetChange}
              options={PRESETS}
            />
            {comparison.target.preset === 'custom' && (
              <div style={{ marginTop: 8 }}>
                <RangePicker
                  style={{ width: '100%' }}
                  value={[
                    comparison.target.customStart ? dayjs(comparison.target.customStart) : null,
                    comparison.target.customEnd ? dayjs(comparison.target.customEnd) : null,
                  ]}
                  onChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      updateComparisonTarget({
                        customStart: dates[0].toISOString(),
                        customEnd: dates[1].toISOString(),
                      });
                    } else {
                      updateComparisonTarget({ customStart: undefined, customEnd: undefined });
                    }
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <Typography.Text type="secondary" style={{ marginBottom: 4, display: 'block', fontSize: 12 }}>
              Baseline Period (Comparison)
            </Typography.Text>
            <Select
              style={{ width: '100%' }}
              value={comparison.baseline.preset || '1M'}
              onChange={(val) => updateComparisonBaseline({ preset: val })}
              options={getBaselinePresetsForTarget(comparison.target.preset)}
            />
            {comparison.baseline.preset === 'custom' && (
              <div style={{ marginTop: 8 }}>
                <RangePicker
                  style={{ width: '100%' }}
                  value={[
                    comparison.baseline.customStart ? dayjs(comparison.baseline.customStart) : null,
                    comparison.baseline.customEnd ? dayjs(comparison.baseline.customEnd) : null,
                  ]}
                  onChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      updateComparisonBaseline({
                        customStart: dates[0].toISOString(),
                        customEnd: dates[1].toISOString(),
                      });
                    } else {
                      updateComparisonBaseline({ customStart: undefined, customEnd: undefined });
                    }
                  }}
                />
              </div>
            )}
          </div>
        </Flex>
      )}
    </Flex>
  );
};
