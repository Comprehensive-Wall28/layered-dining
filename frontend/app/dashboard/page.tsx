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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Rating,
    Snackbar,
    Alert
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
import { feedbackService } from '../../services/feedbackService';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timelineItems, setTimelineItems] = useState<any[]>([]);

    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
    const [feedbackSuccess, setFeedbackSuccess] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

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




    const handleFeedbackSubmit = async () => {
        if (!feedbackText.trim()) return;
        setFeedbackSubmitting(true);
        try {
            await feedbackService.submitFeedback(feedbackText, feedbackRating);
            setFeedbackSuccess(true);
            setFeedbackText('');
            setFeedbackRating(5);
        } catch (error) {
            console.error('Feedback submission failed', error);
            setSnackbar({ open: true, message: 'Failed to submit feedback', severity: 'error' });
        } finally {
            setFeedbackSubmitting(false);
        }
    };

    const handleFeedbackClose = () => {
        setFeedbackOpen(false);
        // Reset success state after a delay to allow animation or immediate reset
        setTimeout(() => setFeedbackSuccess(false), 300);
    };

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
                            onClick={() => { setFeedbackSuccess(false); setFeedbackOpen(true); }}
                            sx={{ mt: 2, width: '100%', mb: 2 }}
                        >
                            Give Feedback
                        </Button>

                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleLogout}
                            sx={{ width: '100%' }}
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
                                                        : `Total: $${(item.data.totalPrice || 0).toFixed(2)} • ${item.data.status}`
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
            {/* Feedback Dialog */}
            {/* Using a simple fixed overlay for now, but ideally use MUI Dialog. 
                Wait, I am using MUI. Let's use Dialog properly if I import it. 
                Checking imports... need to add Dialog imports. 
                I'll add the imports in a separate call or hack it here if allowMultiple.
                Ah, I can only replace contiguous blocks. I need to update imports first.
                WAIT. I will use the `multi_replace_file_content` or just overwrite the file or careful replace. 
                Actually, I'll use `replace_file_content` for the imports FIRST. 
             */}
            {/* Feedback Dialog */}
            {/* Feedback Dialog */}
            <Dialog open={feedbackOpen} onClose={handleFeedbackClose}>
                <DialogTitle>Give Feedback</DialogTitle>
                <DialogContent sx={{ minWidth: 400 }}>
                    {feedbackSuccess ? (
                        <Box sx={{ py: 3, textAlign: 'center' }}>
                            <Typography variant="h6" color="success.main" gutterBottom>
                                Thank you!
                            </Typography>
                            <Typography>
                                Your feedback has been submitted successfully.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography component="legend">Rating:</Typography>
                                <Rating
                                    name="feedback-rating"
                                    value={feedbackRating}
                                    onChange={(event, newValue) => {
                                        setFeedbackRating(newValue || 5);
                                    }}
                                />
                            </Box>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="feedback"
                                label="Your Feedback"
                                type="text"
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    {feedbackSuccess ? (
                        <Button onClick={handleFeedbackClose} variant="contained">Close</Button>
                    ) : (
                        <>
                            <Button onClick={handleFeedbackClose}>Cancel</Button>
                            <Button onClick={handleFeedbackSubmit} disabled={feedbackSubmitting} variant="contained">
                                {feedbackSubmitting ? 'Submitting...' : 'Submit'}
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container >
    );
}
