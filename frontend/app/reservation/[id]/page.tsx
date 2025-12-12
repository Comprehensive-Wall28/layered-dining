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
    Alert
} from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { reservationService } from '../../../services/reservationService';

export default function ReservationDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [reservation, setReservation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReservation = async () => {
            try {
                if (params.id) {
                    const data = await reservationService.getReservationById(params.id as string);
                    setReservation(data.reservation);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load reservation details');
            } finally {
                setLoading(false);
            }
        };

        fetchReservation();
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

    if (!reservation) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Alert severity="warning">Reservation not found</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mt: 2 }}>
                    Back
                </Button>
            </Container>
        );
    }

    const { reservationDate, startTime, endTime, partySize, status, tableId, customerName, customerEmail, specialRequests, occasion } = reservation;
    const dateObj = new Date(reservationDate);

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.back()}
                sx={{ mb: 4 }}
            >
                Back to Dashboard
            </Button>

            <Paper elevation={0} sx={{ p: 4, border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <EventSeatIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                            Reservation Details
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Reference ID: {reservation._id}
                        </Typography>
                    </Box>
                    <Chip
                        label={status}
                        color={status === 'Confirmed' ? 'success' : status === 'Pending' ? 'warning' : 'default'}
                        sx={{ ml: 'auto', fontWeight: 'bold' }}
                    />
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Date & Time
                        </Typography>
                        <Typography variant="h6">
                            {dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Typography>
                        <Typography variant="h6" color="primary">
                            {startTime} - {endTime}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Party Info
                        </Typography>
                        <Typography variant="h6">
                            {partySize} Guests
                        </Typography>
                        <Typography variant="body1">
                            Occasion: {occasion}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Contact Details
                        </Typography>
                        <Typography variant="body1">
                            {customerName}
                        </Typography>
                        <Typography variant="body1">
                            {customerEmail}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Table Info
                        </Typography>
                        <Typography variant="body1">
                            Table {tableId?.tableNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Location: {tableId?.location || 'Main Hall'}
                        </Typography>
                    </Grid>

                    {specialRequests && (
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Special Requests
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Typography variant="body1">
                                    {specialRequests}
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Paper>
        </Container>
    );
}
