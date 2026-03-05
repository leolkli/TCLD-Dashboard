import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
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
    dashboards: [
      { id: 'd1', name: 'Chiller Plant' },
    ],
  },
  // Building B (e.g., KMB)
  {
    id: 'f2',
    name: 'Solar Power',
    buildingCode: 'KMB',
    dashboards: [
      { id: 'd2', name: 'PV Generation' },
    ],
  },
];

export const DashboardFolderManagementPage: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>(MOCK_DB_FOLDERS);
  const [buildings, setBuildings] = useState<{code: string, name: string}[]>([]);
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
        const flatBuildings = hierarchy.flatMap(p => p.buildings);
        setBuildings(flatBuildings);
        
        // Default to first building if available
        if (flatBuildings.length > 0) {
            setSelectedBuilding(flatBuildings[0].code);
        }
      } catch (err) {
        console.error("Failed to load buildings", err);
      } finally {
        setLoading(false);
      }
    };
    loadBuildings();
  }, []);

  // Filter folders by selected building
  const displayedFolders = folders.filter(f => f.buildingCode === selectedBuilding);

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
    } else {
      // Create new (Contextually scoped to selectedBuilding)
      const newId = Math.random().toString(36).substr(2, 9);
      setFolders((prev) => [
        ...prev,
        { 
            id: newId, 
            name: folderName, 
            buildingCode: selectedBuilding,
            dashboards: [] 
        },
      ]);
    }
    handleCloseDialog();
  };

  const handleDeleteFolder = (id: string) => {
    if (confirm('Are you sure you want to delete this folder?')) {
      setFolders((prev) => prev.filter((f) => f.id !== id));
    }
  };

  if (loading) {
    return <Box p={3}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="600">
          Folder Management
        </Typography>
        
        <Box display="flex" gap={2}>
            <FormControl sx={{ minWidth: 200 }} size="small">
                <InputLabel>Select Building</InputLabel>
                <Select
                    value={selectedBuilding}
                    label="Select Building"
                    onChange={(e) => setSelectedBuilding(e.target.value)}
                >
                    {buildings.map((b) => (
                        <MenuItem key={b.code} value={b.code}>{b.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenFolderDialog()}
            disabled={!selectedBuilding}
            >
            New Folder
            </Button>
        </Box>
      </Box>

      <Typography variant="body1" color="text.secondary" paragraph>
        {selectedBuilding 
            ? `Managing folders for: ${buildings.find(b => b.code === selectedBuilding)?.name}` 
            : 'Please select a building to manage its dashboard folders.'}
      </Typography>

      {selectedBuilding && (
        <Grid container spacing={3}>
            {displayedFolders.length === 0 && (
                <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No folders found for this building. Create one to get started.</Typography>
                    </Paper>
                </Grid>
            )}
            
            {displayedFolders.map((folder) => (
            <Grid item xs={12} md={6} lg={4} key={folder.id}>
                <Paper
                elevation={2}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative',
                }}
                >
                {/* Folder Header */}
                <Box
                    sx={{
                    p: 2,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FolderIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">{folder.name}</Typography>
                    </Box>
                    <Box>
                    <IconButton
                        size="small"
                        onClick={() => handleOpenFolderDialog(folder)}
                        sx={{ color: 'inherit' }}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => handleDeleteFolder(folder.id)}
                        sx={{ color: 'inherit' }}
                    >
                        <DeleteIcon />
                    </IconButton>
                    </Box>
                </Box>

                <Divider />

                {/* Dashboards List (Read-Only Preview here) */}
                <List sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.paper' }}>
                    {folder.dashboards.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                        Empty Folder
                        </Typography>
                    </Box>
                    ) : (
                    folder.dashboards.map((dashboard) => (
                        <ListItem key={dashboard.id}>
                        <DashboardIcon
                            fontSize="small"
                            color="action"
                            sx={{ mr: 2 }}
                        />
                        <ListItemText primary={dashboard.name} />
                        </ListItem>
                    ))
                    )}
                </List>
                </Paper>
            </Grid>
            ))}
        </Grid>
      )}

      {/* Edit/Create Folder Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingFolder ? 'Edit Folder' : 'New Folder'}</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveCheck} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
