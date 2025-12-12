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
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineOppositeContent
} from '@mui/lab';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { authService } from '../../services/authService';
import { reservationService } from '../../services/reservationService';
import { orderService } from '../../services/orderService';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timelineItems, setTimelineItems] = useState<any[]>([]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = await authService.getCurrentUser();
                if (!userData) {
                    router.replace('/login');
                } else {
                    setUser(userData);
                    fetchTimelineData(userData.id);
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

    const fetchTimelineData = async (userId: string) => {
        try {
            const [reservationsData, ordersData] = await Promise.all([
                reservationService.getUserReservations(),
                orderService.getOrdersByCustomerId(userId)
            ]);

            const reservations = reservationsData.reservations.map((r: any) => ({
                type: 'reservation',
                date: new Date(`${r.reservationDate.split('T')[0]}T${r.startTime}`),
                data: r
            }));

            const orders = ordersData.data.map((o: any) => ({
                type: 'order',
                date: new Date(o.createdAt),
                data: o
            }));

            const combined = [...reservations, ...orders].sort((a, b) => b.date.getTime() - a.date.getTime());
            setTimelineItems(combined);
        } catch (error) {
            console.error('Failed to fetch timeline data:', error);
        }
    };

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
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            border: '1px solid rgba(0, 0, 0, 0.05)',
                            borderRadius: 3,
                            minHeight: '400px'
                        }}
                    >
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                            Recent Activity
                        </Typography>

                        <Timeline position="right">
                            {timelineItems.length > 0 ? (
                                timelineItems.map((item, index) => (
                                    <TimelineItem key={index}>
                                        <TimelineOppositeContent color="text.secondary" sx={{ py: '12px', px: 2 }}>
                                            {item.date.toLocaleDateString()}
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </TimelineOppositeContent>
                                        <TimelineSeparator>
                                            <TimelineDot color={item.type === 'reservation' ? 'primary' : 'success'}>
                                                {item.type === 'reservation' ? <EventSeatIcon /> : <RestaurantIcon />}
                                            </TimelineDot>
                                            {index < timelineItems.length - 1 && <TimelineConnector />}
                                        </TimelineSeparator>
                                        <TimelineContent sx={{ py: '12px', px: 2 }}>
                                            <Paper
                                                elevation={0}
                                                onClick={() => router.push(
                                                    item.type === 'reservation'
                                                        ? `/reservation/${item.data._id}`
                                                        : `/orders/${item.data._id}`
                                                )}
                                                sx={{
                                                    p: 2,
                                                    cursor: 'pointer',
                                                    '&:hover': { bgcolor: 'action.hover' },
                                                    border: '1px solid rgba(0, 0, 0, 0.05)',
                                                    borderRadius: 2
                                                }}
                                            >
                                                <Typography variant="h6" component="span" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                                                    {item.type === 'reservation' ? 'Table Reservation' : 'Order Placed'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.type === 'reservation'
                                                        ? `Party of ${item.data.partySize} • ${item.data.status}`
                                                        : `Total: $${item.data.totalAmount.toFixed(2)} • ${item.data.status}`
                                                    }
                                                </Typography>
                                            </Paper>
                                        </TimelineContent>
                                    </TimelineItem>
                                ))
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 5 }}>
                                    <Typography color="text.secondary">
                                        No recent activity found.
                                    </Typography>
                                </Box>
                            )}
                        </Timeline>
                    </Paper>
                </Grid>
            </Grid>
        </Container >
    );
}
