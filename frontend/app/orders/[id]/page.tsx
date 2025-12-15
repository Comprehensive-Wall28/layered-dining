'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Container,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Divider,
    Button,
    Grid,
    Chip,
    Alert,
    Stepper,
    Step,
    StepLabel,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { orderService } from '../../../services/orderService';

const ORDER_STEPS = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed'];

export default function OrderTrackingPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [statusHistory, setStatusHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                if (params.id) {
                    const data = await orderService.getOrderById(params.id as string);
                    setOrder(data.data); // data.data because orderService returns { success: true, data: order }
                    // Simulate status history or if backend provides it
                    // For now, we derive active step from status
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [params.id]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Alert severity="error">{error}</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mt: 2 }}>
                    Back
                </Button>
            </Container>
        );
    }

    if (!order) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Alert severity="warning">Order not found</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mt: 2 }}>
                    Back
                </Button>
            </Container>
        );
    }

    // Determine active step index
    const activeStep = ORDER_STEPS.indexOf(order.status);
    const dateObj = new Date(order.createdAt);

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.back()}
                sx={{ mb: 4 }}
            >
                Back to Dashboard
            </Button>

            <Paper elevation={0} sx={{ p: 4, border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                            Order Tracking
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                        </Typography>
                    </Box>
                    <Chip
                        label={order.status}
                        color={
                            order.status === 'Completed' ? 'success' :
                                order.status === 'Ready' ? 'success' :
                                    order.status === 'Preparing' ? 'info' :
                                        order.status === 'Confirmed' ? 'primary' :
                                            order.status === 'Cancelled' ? 'error' :
                                                'primary'
                        }
                        sx={{ ml: 'auto', fontWeight: 'bold' }}
                    />
                </Box>

                {order.paymentStatus === 'Refunded' && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        This order has been refunded.
                    </Alert>
                )}

                <Divider sx={{ mb: 4 }} />

                <Box sx={{ width: '100%', mb: 6 }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {ORDER_STEPS.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="h6" gutterBottom>
                            Order Details
                        </Typography>
                        <List dense>
                            {(order.items || []).map((item: any, index: number) => (
                                <ListItem key={index}>
                                    <ListItemIcon>
                                        <RestaurantIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={`${item.quantity}x ${item.menuItemId?.name || 'Item'}`}
                                        secondary={`$${item.price.toFixed(2)}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6">Total</Typography>
                            <Typography variant="h6" color="primary">${(order.totalPrice || 0).toFixed(2)}</Typography>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="h6" gutterBottom>
                            Info
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                            Date
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString()}
                        </Typography>

                        <Typography variant="subtitle2" color="text.secondary">
                            Payment Status
                        </Typography>
                        <Typography variant="body1" component="div" sx={{ mb: 2 }}>
                            <Chip
                                label={order.paymentStatus}
                                size="small"
                                variant="outlined"
                                color={order.paymentStatus === 'Refunded' ? 'warning' : 'default'}
                            />
                        </Typography>

                        <Typography variant="subtitle2" color="text.secondary">
                            Order Type
                        </Typography>
                        <Typography variant="body1">
                            {order.orderType}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}
