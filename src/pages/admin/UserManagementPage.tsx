import React, { useState } from 'react';
import {
  Typography,
  Card,
  Table,
  Input,
  Tag,
  Button,
  Tooltip,
  Avatar,
  Space
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  MoreOutlined
} from '@ant-design/icons';
import type { UserWithRoles } from '@/types';

const { Title, Text } = Typography;

// Mock user data
const mockUsers: UserWithRoles[] = [
  {
    id: '1',
    entraObjectId: 'aaa-bbb-ccc',
    email: 'admin@tcld.com',
    displayName: 'John Admin',
    firstName: 'John',
    lastName: 'Admin',
    roles: ['super_admin'],
    roleDetails: [],
    buildingAccess: [],
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    entraObjectId: 'ddd-eee-fff',
    email: 'building.manager@tcld.com',
    displayName: 'Jane Manager',
    firstName: 'Jane',
    lastName: 'Manager',
    roles: ['building_admin'],
    roleDetails: [],
    buildingAccess: [],
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    entraObjectId: 'ggg-hhh-iii',
    email: 'user@tcld.com',
    displayName: 'Bob User',
    firstName: 'Bob',
    lastName: 'User',
    roles: ['user'],
    roleDetails: [],
    buildingAccess: [],
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const roleColors: Record<string, string> = {
  super_admin: 'volcano',
  building_admin: 'orange',
  user: 'default',
};

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  building_admin: 'Building Admin',
  user: 'User',
};

/**
 * User Management Page Component
 * List, search, and manage users
 */
export const UserManagementPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = mockUsers.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: UserWithRoles) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1677ff' }}>
            {record.displayName.charAt(0)}
          </Avatar>
          <Text strong>{record.displayName}</Text>
        </Space>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      key: 'roles',
      dataIndex: 'roles',
      render: (roles: string[]) => (
        <>
          {roles.map((role) => (
            <Tag color={roleColors[role] || 'default'} key={role}>
              {roleLabels[role] || role}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Status',
      key: 'isActive',
      dataIndex: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      key: 'lastLoginAt',
      dataIndex: 'lastLoginAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'Never'
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right' as const,
      render: () => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="More">
            <Button type="text" icon={<MoreOutlined />} />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>User Management</Title>
        <Text type="secondary">Manage user roles and building access permissions</Text>
      </div>

      {/* Search and Actions */}
      <div style={{ marginBottom: 24 }}>
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
          style={{ width: 300 }}
        />
      </div>

      {/* Users Table */}
      <Card variant="borderless" className="shadow-sm" styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
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
