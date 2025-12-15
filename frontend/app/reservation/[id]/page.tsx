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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Stack
} from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import { reservationService } from '../../../services/reservationService';

export default function ReservationDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [reservation, setReservation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Dialog States
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [modifyDialogOpen, setModifyDialogOpen] = useState(false);

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

    const handleCancelReservation = async () => {
        setActionLoading(true);
        try {
            await reservationService.cancelReservation(reservation._id);
            setReservation({ ...reservation, status: 'Cancelled' });
            setCancelDialogOpen(false);
        } catch (err: any) {
            setError(err.message || 'Failed to cancel reservation');
        } finally {
            setActionLoading(false);
        }
    };

    const handleModifyReservation = async () => {
        // For modification, we will cancel the current one and redirect to booking page
        // The user will be warned about this in the dialog
        setActionLoading(true);
        try {
            await reservationService.cancelReservation(reservation._id);
            // Redirect to reservation page with pre-filled details if possible could be a nice enhancement,
            // but for now redirecting to clean slate
            router.push('/reservation');
        } catch (err: any) {
            setError(err.message || 'Failed to process modification request');
            setActionLoading(false);
        }
    };

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
    const canModify = status === 'Pending' || status === 'Confirmed';

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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <EventSeatIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
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
                        sx={{ fontWeight: 'bold' }}
                    />
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={4} sx={{ mb: 4 }}>
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

                {canModify && (
                    <>
                        <Divider sx={{ mb: 3 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => setCancelDialogOpen(true)}
                            >
                                Cancel Reservation
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<EditIcon />}
                                onClick={() => setModifyDialogOpen(true)}
                            >
                                Modify Reservation
                            </Button>
                        </Box>
                    </>
                )}
            </Paper>

            {/* Cancel Dialog */}
            <Dialog
                open={cancelDialogOpen}
                onClose={() => setCancelDialogOpen(false)}
            >
                <DialogTitle>Cancel Reservation?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to cancel this reservation? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialogOpen(false)}>No, Keep it</Button>
                    <Button onClick={handleCancelReservation} color="error" autoFocus disabled={actionLoading}>
                        {actionLoading ? 'Cancelling...' : 'Yes, Cancel Reservation'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modify Dialog */}
            <Dialog
                open={modifyDialogOpen}
                onClose={() => setModifyDialogOpen(false)}
            >
                <DialogTitle>Modify Reservation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To modify your reservation, we need to cancel the current one and take you to the booking page to create a new reservation.
                        <br /><br />
                        Do you want to proceed?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModifyDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleModifyReservation} variant="contained" color="primary" autoFocus disabled={actionLoading}>
                        {actionLoading ? 'Processing...' : 'Proceed to Re-book'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
