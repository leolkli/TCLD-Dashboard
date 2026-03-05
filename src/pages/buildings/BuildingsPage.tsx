
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BusinessIcon from '@mui/icons-material/Business';
import { synapseService } from '@/services/synapseService';
import type { SynapsePortfolio } from '@/types/synapse';

/**
 * Buildings Page Component
 * Renders the Portfolio > Building hierarchy fetched from Synapse.
 */
export const BuildingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [hierarchy, setHierarchy] = useState<SynapsePortfolio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await synapseService.getHierarchy();
                setHierarchy(data || []);
            } catch (err: any) {
                console.error("API Error, using fallback data", err);
                // Fallback mock data
                 setHierarchy([{
                    name: "Demo Portfolio",
                    buildings: [
                        {code: "TKO", name: "Tseung Kwan O"},
                        {code: "KMB", name: "KMB Depot"}
                    ]
                }]);
                // Clear error so UI renders
                setError(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ p: 3 }}>
            <Box mb={4}>
                <Typography variant="h4" gutterBottom>
                    Portfolio Overview
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Select a building to view details and tags.
                </Typography>
            </Box>

            {hierarchy.length === 0 && (
                <Alert severity="info">No portfolios found.</Alert>
            )}

            {hierarchy.map((portfolio) => (
                <Accordion key={portfolio.name} defaultExpanded sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center" width="100%" justifyContent="space-between" pr={2}>
                            <Typography variant="h6">{portfolio.name}</Typography>
                            <Chip size="small" label={`${portfolio.buildings.length} Buildings`} />
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            {portfolio.buildings.map((building) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={building.code}>
                                    <Card variant="outlined" sx={{ height: '100%' }}>
                                        <CardActionArea 
                                            onClick={() => navigate(`/buildings/${building.code}`, { state: { buildingName: building.name } })}
                                            sx={{ height: '100%' }}
                                        >
                                            <CardContent>
                                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                    <BusinessIcon color="primary" />
                                                    <Typography variant="subtitle1" noWrap title={building.name}>
                                                        {building.name}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="caption" color="textSecondary" display="block">
                                                    Code: {building.code}
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                            {portfolio.buildings.length === 0 && (
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="textSecondary" sx={{ px: 2, pb: 2 }}>
                                        No buildings assigned to this portfolio.
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};
