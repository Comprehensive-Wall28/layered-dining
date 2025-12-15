'use client';

import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Box,
    Stepper,
    Step,
    StepLabel,
    CircularProgress,
    Alert
} from '@mui/material';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';


interface OrderCreationData {
    items: any[];
    orderType: string;
    customerNotes: string;
    paymentStatus: string;
}

export default function CheckoutPage() {
    const { cart, itemsCount, isLoading, refreshCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    const [activeStep, setActiveStep] = useState(0);
    const [orderType, setOrderType] = useState('Takeaway');
    const [customerNotes, setCustomerNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoading && (!cart || cart.items.length === 0)) {
            // Redirect to menu if cart is empty, but give it a moment in case of refresh delay
            // For now just show message
        }
    }, [cart, isLoading, router]);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handlePlaceOrder = async () => {
        setIsSubmitting(true);
        setError('');

        try {
            const orderData: OrderCreationData = {
                items: cart?.items || [],
                orderType,
                customerNotes,
                paymentStatus: 'Paid' // Mock payment
            };

            // We need to fetch directly here or use a service.
            // Using fetch for now to keep it self contained or I should use orderService if I made create method.
            // I checked orderService earlier and it only had get methods. I should assume I need to fetch here or update orderService.
            // I will use fetch here for simplicity as I didn't add createOrder to orderService in the plan (Wait, I did check the plan "Call orderService.createOrder").
            // I need to update orderService first? Or just fetch here. 
            // The plan said "Call orderService.createOrder". I should update orderService!

            // Actually, I'll implementations of createOrder inside this file for speed as this is a page, 
            // but cleaner to put in service. I'll put it here for now to avoid context switching if I didn't update service yet.
            // Wait, I haven't updated orderService yet. I should do that.
            // But I'm in the middle of writing this file. I'll define a helper here or directly fetch.

            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_BASE_URL}/api/v1/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData),
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to place order');
            }

            const responseData = await response.json();

            // Clear cart
            await refreshCart(); // effectively clears it as backend emptied it.

            router.push(`/orders/${responseData.data._id}`); // Redirect to order details

        } catch (err: any) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    }

    if (!cart || cart.items.length === 0) {
        return (
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>Your cart is empty</Typography>
                <Button variant="contained" onClick={() => router.push('/menu')}>Go to Menu</Button>
            </Container>
        );
    }

    const steps = ['Review Order', 'Payment Details', 'Confirmation'];

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>Checkout</Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 8 }}>
                    {activeStep === 0 && (
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Order Summary</Typography>
                                <List>
                                    {cart.items.map((item: any) => {
                                        const details = item.menuItemId;
                                        return (
                                            <React.Fragment key={item._id}>
                                                <ListItem alignItems="flex-start">
                                                    <ListItemAvatar>
                                                        <Avatar src={details.image || '/placeholder-food.png'} variant="rounded" />
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={details.name}
                                                        secondary={`Quantity: ${item.quantity}`}
                                                    />
                                                    <Typography variant="body1" fontWeight="bold">
                                                        ${(details.price * item.quantity).toFixed(2)}
                                                    </Typography>
                                                </ListItem>
                                                <Divider component="li" />
                                            </React.Fragment>
                                        );
                                    })}
                                </List>

                                <Box sx={{ mt: 2 }}>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend">Order Type</FormLabel>
                                        <RadioGroup row aria-label="orderType" name="row-radio-buttons-group" value={orderType} onChange={(e) => setOrderType(e.target.value)}>
                                            <FormControlLabel value="Takeaway" control={<Radio />} label="Takeaway" />
                                            <FormControlLabel value="Dine-In" control={<Radio />} label="Dine-In" />
                                            <FormControlLabel value="Delivery" control={<Radio />} label="Delivery" />
                                        </RadioGroup>
                                    </FormControl>
                                </Box>

                                <TextField
                                    label="Notes for Kitchen"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    variant="outlined"
                                    value={customerNotes}
                                    onChange={(e) => setCustomerNotes(e.target.value)}
                                    sx={{ mt: 2 }}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {activeStep === 1 && (
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Payment Details</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    This is a mock checkout. No real payment will be processed.
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField label="Card Number" fullWidth variant="outlined" defaultValue="4242 4242 4242 4242" disabled />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField label="Expiry" fullWidth variant="outlined" defaultValue="12/25" disabled />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField label="CVV" fullWidth variant="outlined" defaultValue="123" disabled />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField label="Cardholder Name" fullWidth variant="outlined" defaultValue={user?.name || 'John Doe'} disabled />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    )}
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Total</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Subtotal</Typography>
                                <Typography>${cart.totalPrice.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography>Tax (0%)</Typography>
                                <Typography>$0.00</Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h5" fontWeight="bold">Total</Typography>
                                <Typography variant="h5" fontWeight="bold">${cart.totalPrice.toFixed(2)}</Typography>
                            </Box>

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                                <Button
                                    disabled={activeStep === 0}
                                    onClick={handleBack}
                                >
                                    Back
                                </Button>
                                {activeStep === steps.length - 2 ? (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handlePlaceOrder}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? <CircularProgress size={24} /> : 'Pay & Order'}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                    >
                                        Next
                                    </Button>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
