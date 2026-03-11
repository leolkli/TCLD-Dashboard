import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Input, Button, Checkbox, Tag, Flex, Typography, Select, Spin } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useWidgetConfigStore } from '@/store/widgetConfigStore';
import { synapseService } from '@/services/synapseService';
import type { SynapsePTag } from '@/types/synapse';
import type { SelectedDataPoint } from '@/types/widget';

interface TagSearchDialogProps {
  targetAxis?: 'x' | 'y';
  open: boolean;
  onClose: () => void;
}

export const TagSearchDialog: React.FC<TagSearchDialogProps> = ({ open, onClose, targetAxis }) => {
  const { config, addDataPoint, filterOptions, fetchFilterOptions } = useWidgetConfigStore();

  const [query, setQuery] = useState('');
  const [building, setBuilding] = useState(config.buildingCode || '');
  const [system, setSystem] = useState('');
  const [commodity, setCommodity] = useState('');
  const [results, setResults] = useState<(SynapsePTag & { Building?: string })[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setBuilding(config.buildingCode || '');
    }
  }, [open, config.buildingCode]);

  useEffect(() => {
    if (open && filterOptions.buildings.length === 0) {
      fetchFilterOptions();
    }
  }, [open, filterOptions.buildings.length, fetchFilterOptions]);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await synapseService.searchTags({
        q: query || undefined,
        building: building || undefined,
        system: system || undefined,
        commodity: commodity || undefined,
        limit: 50,
      });
      setResults(response.tags);
      setTotal(response.total);
    } catch {
      console.warn('Tag search failed, showing empty results');
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [query, building, system, commodity]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      handleSearch();
    }, 400);
    return () => clearTimeout(timer);
  }, [query, building, system, commodity, open, handleSearch]);

  const toggleSelect = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleAdd = () => {
    results
      .filter((tag) => selected.has(tag.Code))
      .forEach((tag) => {
        const dp: SelectedDataPoint = {
          code: tag.Code,
          name: tag.Name,
          building: tag.Building || '',
          system: tag.System || '',
          uom: tag.UOM || '',
          commodity: tag.Commodity || '',
          color: '',
          axisIndex: 0,
          axis: targetAxis || 'y',
        };
        addDataPoint(dp);
      });
    setSelected(new Set());
    onClose();
  };

  const handleClose = () => {
    setSelected(new Set());
    setQuery('');
    onClose();
  };

  const existingCodes = new Set(config.dataPoints.map((dp) => dp.code));

  return (
    <Modal
      title="Search Tags"
      open={open}
      onCancel={handleClose}
      onOk={handleAdd}
      okButtonProps={{ disabled: selected.size === 0 }}
      okText={selected.size > 0 ? `Add ${selected.size} Tag${selected.size > 1 ? 's' : ''}` : 'Add Tags'}
      width={600}
      styles={{ body: { maxHeight: '60vh', overflowY: 'auto' } }}
    >
      <Input
        placeholder="Search by name or code..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
        suffix={loading ? <Spin size="small" /> : null}
        style={{ marginBottom: 12 }}
        autoFocus
      />

      <Flex align="center" gap="small" style={{ marginBottom: 12 }}>
        <Button
          size="small"
          icon={<FilterOutlined />}
          onClick={() => setShowFilters(!showFilters)}
          type={showFilters ? 'primary' : 'default'}
        >
          Filters
        </Button>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {total} tag{total !== 1 ? 's' : ''} found
        </Typography.Text>
        {selected.size > 0 && (
          <Tag color="blue" closable onClose={() => setSelected(new Set())}>
            {selected.size} selected
          </Tag>
        )}
      </Flex>

      {showFilters && (
        <Flex gap="small" style={{ marginBottom: 12 }}>
          <Select
            allowClear
            placeholder="Building"
            value={building || undefined}
            onChange={setBuilding}
            style={{ width: 120 }}
            disabled={!!config.buildingCode}
            options={filterOptions.buildings.map(b => ({ label: b, value: b }))}
          />
          <Select
            allowClear
            placeholder="System"
            value={system || undefined}
            onChange={setSystem}
            style={{ width: 120 }}
            options={filterOptions.systems.map(s => ({ label: s, value: s }))}
          />
          <Select
            allowClear
            placeholder="Commodity"
            value={commodity || undefined}
            onChange={setCommodity}
            style={{ width: 120 }}
            options={filterOptions.commodities.map(c => ({ label: c, value: c }))}
          />
        </Flex>
      )}

      {results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(0,0,0,0.45)' }}>
          {query || building || system || commodity ? 'No tags match your search' : 'Start typing to search tags'}
        </div>
      ) : (
        <Flex vertical gap={4}>
          {results.map((tag) => {
            const alreadyAdded = existingCodes.has(tag.Code);
            const isSelected = selected.has(tag.Code);
            return (
              <div
                key={tag.Code}
                onClick={() => !alreadyAdded && toggleSelect(tag.Code)}
                style={{
                  cursor: alreadyAdded ? 'not-allowed' : 'pointer',
                  backgroundColor: isSelected ? '#e6f4ff' : 'transparent',
                  borderRadius: 6,
                  padding: '8px 12px',
                  border: 'none',
                }}
              >
                <Flex align="center" gap="small" style={{ width: '100%' }}>
                  <Checkbox checked={isSelected || alreadyAdded} disabled={alreadyAdded} />
                  <div style={{ flex: 1 }}>
                    <Typography.Text strong>{tag.Name}</Typography.Text>
                    <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                      {tag.Building} &middot; {tag.System} &middot; {tag.UOM} &middot; {tag.Commodity}
                    </div>
                  </div>
                  {alreadyAdded && <Tag color="success">Added</Tag>}
                </Flex>
              </div>
            );
          })}
        </Flex>
      )}
    </Modal>
  );
};
