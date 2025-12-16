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
    Button
} from '@mui/material';
import { authService } from '../../services/authService';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = await authService.getCurrentUser();
                if (!userData) {
                    router.replace('/login');
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

    const handleLogout = async () => {
        await authService.logout();
        router.replace('/login');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return null; // or redirecting...
    }

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
                My Dashboard
            </Typography>

            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    border: '1px solid #e0e0e0',
                    borderRadius: 3,
                }}
            >
                <Grid container spacing={4} alignItems="center">
                    <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'center' }}>
                        <Avatar
                            sx={{
                                width: 120,
                                height: 120,
                                bgcolor: 'secondary.main',
                                fontSize: '3rem',
                                margin: '0 auto',
                                mb: 2
                            }}
                        >
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {user.role}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 8 }}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Email Address
                            </Typography>
                            <Typography variant="body1">
                                {user.email}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Box sx={{ mb: 3 }}>
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
                            sx={{ mt: 2 }}
                        >
                            Sign Out
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}
