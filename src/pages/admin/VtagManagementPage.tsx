import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Table,
  Input,
  Tag,
  Button,
  Tooltip,
  Modal,
  Space
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  HistoryOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export const VtagManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [vtags, setVtags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete modal usage via antd Modal.confirm
  const [modal, contextHolder] = Modal.useModal();

  const fetchVtags = () => {
    setLoading(true);
    fetch('/api/vtags')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setVtags(data.data);
        }
      })
      .catch(err => console.error("Error fetching vtags:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVtags();
  }, []);

  const showDeleteConfirm = (vtag: any) => {
    modal.confirm({
      title: 'Delete Virtual Tag',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete ${vtag.name} (${vtag.systemCode})? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`/api/vtags/${vtag.systemCode}`, {
            method: 'DELETE'
          });
          const data = await response.json();
          if (data.success) {
            setVtags(prev => prev.filter(v => v.systemCode !== vtag.systemCode));
          }
        } catch (err) {
          console.error("Failed to delete", err);
        }
      },
    });
  };

  const filteredVtags = vtags.filter(v =>
    (v.name && v.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (v.systemCode && v.systemCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getColumnSearchProps = (dataIndex: string) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => {
              clearFilters && clearFilters();
              confirm();
            }}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value: any, record: any) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes((value as string).toLowerCase())
        : false,
  });

  const columns = [
    {
      title: 'Code',
      dataIndex: 'systemCode',
      key: 'systemCode',
      ...getColumnSearchProps('systemCode'),
      render: (text: string) => <Text strong type="success" style={{ fontSize: '0.85em' }}>{text}</Text>,
    },
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
      ...getColumnSearchProps('name'),
      render: (_: any, record: any) => (
        <div>
          <Text strong><code style={{ fontSize: '0.9em' }}>{record.name}</code></Text>
          {record.description && (
            <div style={{ fontSize: 12, color: 'gray' }}>{record.description}</div>
          )}
        </div>
      )
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      ...getColumnSearchProps('unit'),
    },
    {
      title: 'Calculation Type',
      dataIndex: 'calculationType',
      key: 'calculationType',
      ...getColumnSearchProps('calculationType'),
      render: (text: string) => text || 'N/A'
    },
    {
      title: 'Calculation Step',
      dataIndex: 'calculationStep',
      key: 'calculationStep',
      ...getColumnSearchProps('calculationStep'),
      render: (text: string) => text || 'N/A'
    },
    {
      title: 'Consumption',
      dataIndex: 'isAccumulated',
      key: 'isAccumulated',
      ...getColumnSearchProps('isAccumulated'),
      render: (val: string) => (
        <Tag color={val === 'TRUE' ? 'blue' : 'default'}>
          {val === 'TRUE' ? 'Accumulated' : 'Actual'}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      ...getColumnSearchProps('status'),
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'default'}>
          {status || 'Active'}
        </Tag>
      )
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (ver: number) => <Tag color="purple">v{ver || 1}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/admin/vtags/${record.systemCode}`)} 
            />
          </Tooltip>
          <Tooltip title="Version History">
            <Button 
              type="text" 
              icon={<HistoryOutlined />} 
              onClick={() => navigate(`/admin/vtags/${record.systemCode}?history=true`)} 
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => showDeleteConfirm(record)} 
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      {contextHolder}
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Virtual Tags (Vtags)</Title>
          <Text type="secondary">Define calculated metrics from physical tags (Ptags)</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/vtags/new')}
        >
          New Vtag
        </Button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <Input
          placeholder="Search virtual tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
          style={{ width: 300 }}
        />
      </div>

      {/* Vtags Table */}
      <Card variant="borderless" className="shadow-sm" styles={{ body: { padding: 0 } }}>
        <Table 
          columns={columns} 
          dataSource={filteredVtags} 
          rowKey="id"
          loading={loading}
          pagination={{ 
            defaultPageSize: 10, 
            showSizeChanger: true, 
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
          }}
        />
      </Card>
    </div>
  );
};
