'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Container,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Avatar,
    Grid,
    Divider,
    Button,
    Tabs,
    Tab
} from '@mui/material';
import { authService } from '../../services/authService';
import ReservationManagement from '../../components/Admin/ReservationManagement';
import OrderManagement from '../../components/Admin/OrderManagement';
import TableManagement from '../../components/Table/TableManagement';

export default function ManagerDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = await authService.getCurrentUser();
                if (!userData) {
                    router.replace('/login');
                } else if (userData.role !== 'Manager') {
                    // Redirect non-managers to their appropriate dashboard
                    if (userData.role === 'Admin') {
                        router.replace('/admin');
                    } else {
                        router.replace('/dashboard');
                    }
                } else {
                    setUser(userData);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                router.replace('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleLogout = async () => {
        await authService.logout();
        router.replace('/login');
    };

    const handleDeleteAccount = async () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                await authService.deleteAccount();
                router.replace('/login');
            } catch (error) {
                console.error('Failed to delete account', error);
                alert('Failed to delete account');
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
                Manager Dashboard
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="manager dashboard tabs">
                    <Tab label="Profile" />
                    <Tab label="Management" />
                </Tabs>
            </Box>

            {/* Profile Tab */}
            <div role="tabpanel" hidden={tabValue !== 0}>
                {tabValue === 0 && (
                    <Box sx={{ p: 0 }}>
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                        borderRadius: 3,
                                        textAlign: 'center'
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            bgcolor: 'success.main',
                                            fontSize: '3rem',
                                            margin: '0 auto',
                                            mb: 2
                                        }}
                                    >
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
                                    </Avatar>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {user.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {user.role}
                                    </Typography>

                                    <Divider sx={{ my: 3 }} />

                                    <Box sx={{ mb: 3, textAlign: 'left' }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Email Address
                                        </Typography>
                                        <Typography variant="body1">
                                            {user.email}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 3, textAlign: 'left' }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Account Status
                                        </Typography>
                                        <Typography variant="body1">
                                            Active
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={handleLogout}
                                        sx={{ mt: 2, width: '100%' }}
                                    >
                                        Sign Out
                                    </Button>

                                    <Button
                                        variant="text"
                                        color="error"
                                        onClick={handleDeleteAccount}
                                        sx={{ width: '100%', mt: 1, fontSize: '0.8rem' }}
                                    >
                                        Delete Account
                                    </Button>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </div>

            {/* Management Tab */}
            <div role="tabpanel" hidden={tabValue !== 1}>
                {tabValue === 1 && (
                    <Box sx={{ p: 0 }}>
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                        borderRadius: 3,
                                    }}
                                >
                                    <ReservationManagement />
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                        borderRadius: 3,
                                    }}
                                >
                                    <OrderManagement />
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                        borderRadius: 3,
                                    }}
                                >
                                    <TableManagement />
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </div>
        </Container >
    );
}
