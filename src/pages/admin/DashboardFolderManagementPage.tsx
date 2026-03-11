import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Select,
  Modal,
  Input,
  Space,
  Empty,
  Spin,
  Flex,
  message,
} from 'antd';
import {
  PlusOutlined as AddIcon,
  EditOutlined as EditIcon,
  DeleteOutlined as DeleteIcon,
  FolderOutlined as FolderIcon,
  DashboardOutlined as DashboardIcon,
} from '@ant-design/icons';
import { synapseService } from '@/services/synapseService';

// Mock Data Types
interface Dashboard {
  id: string;
  name: string;
}

interface Folder {
  id: string;
  name: string;
  buildingCode: string; // Enforce building context
  dashboards: Dashboard[];
}

// Initial Mock Data (Grouped by Building for demo)
const MOCK_DB_FOLDERS: Folder[] = [
  // Building A (e.g., TKO)
  {
    id: 'f1',
    name: 'HVAC System',
    buildingCode: 'TKO',
    dashboards: [{ id: 'd1', name: 'Chiller Plant' }],
  },
  // Building B (e.g., KMB)
  {
    id: 'f2',
    name: 'Solar Power',
    buildingCode: 'KMB',
    dashboards: [{ id: 'd2', name: 'PV Generation' }],
  },
];

const { Title, Text, Paragraph } = Typography;

export const DashboardFolderManagementPage: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>(MOCK_DB_FOLDERS);
  const [buildings, setBuildings] = useState<{ code: string; name: string }[]>(
    []
  );
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');

  const [openDialog, setOpenDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(true);

  // Load buildings
  useEffect(() => {
    const loadBuildings = async () => {
      try {
        const hierarchy = await synapseService.getHierarchy();
        // Flatten hierarchy to just a list of buildings
        const flatBuildings = hierarchy.flatMap((p: any) => p.buildings);
        setBuildings(flatBuildings);

        // Default to first building if available
        if (flatBuildings.length > 0) {
          setSelectedBuilding(flatBuildings[0].code);
        }
      } catch (err) {
        console.error('Failed to load buildings', err);
      } finally {
        setLoading(false);
      }
    };
    loadBuildings();
  }, []);

  // Filter folders by selected building
  const displayedFolders = folders.filter(
    (f) => f.buildingCode === selectedBuilding
  );

  // handlers for Folder Dialog
  const handleOpenFolderDialog = (folder?: Folder) => {
    if (folder) {
      setEditingFolder(folder);
      setFolderName(folder.name);
    } else {
      setEditingFolder(null); // Create mode
      setFolderName('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFolder(null);
    setFolderName('');
  };

  const handleSaveCheck = () => {
    if (!folderName.trim() || !selectedBuilding) return;

    if (editingFolder) {
      // Update existing
      setFolders((prev) =>
        prev.map((f) =>
          f.id === editingFolder.id ? { ...f, name: folderName } : f
        )
      );
      message.success('Folder updated successfully');
    } else {
      // Create new (Contextually scoped to selectedBuilding)
      const newId = Math.random().toString(36).substr(2, 9);
      setFolders((prev) => [
        ...prev,
        {
          id: newId,
          name: folderName,
          buildingCode: selectedBuilding,
          dashboards: [],
        },
      ]);
      message.success('Folder created successfully');
    }
    handleCloseDialog();
  };

  const handleDeleteFolder = (id: string) => {
    Modal.confirm({
      title: 'Delete Folder',
      content: 'Are you sure you want to delete this folder?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        setFolders((prev) => prev.filter((f) => f.id !== id));
        message.success('Folder deleted successfully');
      },
    });
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  const selectedBuildingName = buildings.find(
    (b) => b.code === selectedBuilding
  )?.name;

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0 }}>
          Folder Management
        </Title>

        <Space>
          <Select
            style={{ minWidth: 200 }}
            placeholder="Select Building"
            value={selectedBuilding}
            onChange={(value) => setSelectedBuilding(value)}
            options={buildings.map((b) => ({
              label: b.name,
              value: b.code,
            }))}
          />

          <Button
            type="primary"
            icon={<AddIcon />}
            onClick={() => handleOpenFolderDialog()}
            disabled={!selectedBuilding}
          >
            New Folder
          </Button>
        </Space>
      </Flex>

      {/* Info Text */}
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        {selectedBuilding
          ? `Managing folders for: ${selectedBuildingName}`
          : 'Please select a building to manage its dashboard folders.'}
      </Paragraph>

      {/* Folders Grid */}
      {selectedBuilding && (
        <>
          {displayedFolders.length === 0 ? (
            <Card style={{ marginBottom: 24 }}>
              <Empty
                description="No folders found for this building"
                style={{ marginTop: 32, marginBottom: 32 }}
              />
            </Card>
          ) : (
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
              {displayedFolders.map((folder) => (
                <Col xs={24} md={12} lg={8} key={folder.id}>
                  <Card
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    styles={{ body: { padding: 0 } }}
                  >
                    {/* Folder Header */}
                    <Flex
                      justify="space-between"
                      align="center"
                      style={{
                        padding: 16,
                        backgroundColor: '#e6f7ff',
                        borderBottom: '1px solid #91d5ff',
                      }}
                    >
                      <Flex align="center" gap={8}>
                        <FolderIcon style={{ fontSize: 18 }} />
                        <Title level={5} style={{ margin: 0 }}>
                          {folder.name}
                        </Title>
                      </Flex>
                      <Space size={4}>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditIcon />}
                          onClick={() => handleOpenFolderDialog(folder)}
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteIcon />}
                          onClick={() => handleDeleteFolder(folder.id)}
                          danger
                        />
                      </Space>
                    </Flex>

                    {/* Dashboards List */}
                    {folder.dashboards.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 24 }}>
                        <Text type="secondary">Empty Folder</Text>
                      </div>
                    ) : (
                      <Flex vertical style={{ padding: '0 16px' }}>
                        {folder.dashboards.map((dashboard) => (
                          <div
                            key={dashboard.id}
                            style={{ 
                              padding: '12px 0', 
                              borderBottom: '1px solid #f0f0f0',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <DashboardIcon style={{ marginRight: 8 }} />
                            <Text>{dashboard.name}</Text>
                          </div>
                        ))}
                      </Flex>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      {/* Edit/Create Folder Modal */}
      <Modal
        title={editingFolder ? 'Edit Folder' : 'New Folder'}
        open={openDialog}
        onOk={handleSaveCheck}
        onCancel={handleCloseDialog}
        okText="Save"
        cancelText="Cancel"
        width={400}
      >
        <Input
          autoFocus
          placeholder="Folder Name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          style={{ marginTop: 16 }}
          onPressEnter={handleSaveCheck}
        />
      </Modal>
    </div>
  );
};
