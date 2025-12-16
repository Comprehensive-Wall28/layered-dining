"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import { reservationService } from '../../services/reservationService';
import { useAuth } from '../../context/AuthContext';

export default function MyReservationsPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reservations, setReservations] = useState<any[]>([]);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [editLoading, setEditLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await reservationService.getUserReservations();
                setReservations(data.reservations || data || []);
            } catch (err: any) {
                setError(err.message || 'Failed to load reservations');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [user, router]);

    const handleCancel = async (id: string) => {
        setActionLoading(id);
        try {
            const resp = await reservationService.cancelReservation(id);
            const updated = resp.reservation || resp;
            setReservations((prev) => prev.map((r) => r._id === id ? updated : r));
        } catch (err: any) {
            // If backend reports it's already cancelled, reflect that locally instead of failing
            const msg = (err && err.message) ? err.message.toString().toLowerCase() : '';
            if (msg.includes('already cancelled') || msg.includes('already canceled')) {
                setReservations((prev) => prev.map((r) => r._id === id ? { ...r, status: 'Cancelled' } : r));
            } else if (msg.includes('unauthorized') || msg.includes('unauthenticated') || msg.includes('401')) {
                // If unauthorized, show message and avoid changing auth state here
                setError('You are not authorized to cancel this reservation. Please login again.');
            } else {
                setError(err.message || 'Failed to cancel reservation');
            }
        } finally {
            setActionLoading(null);
        }
    };

    const openEdit = (res: any) => {
        setEditing({
            ...res,
            reservationDate: res.reservationDate ? (new Date(res.reservationDate)).toISOString().slice(0,10) : '',
            startTime: res.startTime || '',
            endTime: res.endTime || '',
            partySize: res.partySize || 1
        });
        setEditOpen(true);
    };

    const closeEdit = () => {
        setEditOpen(false);
        setEditing(null);
    };

    const submitEdit = async () => {
        if (!editing) return;
        setEditLoading(true);
        try {
            const payload = {
                reservationDate: editing.reservationDate,
                startTime: editing.startTime,
                endTime: editing.endTime,
                partySize: Number(editing.partySize),
                specialRequests: editing.specialRequests ?? ''
            };
            const resp = await reservationService.updateReservation(editing._id, payload);
            const updated = resp.reservation || resp;
            setReservations((prev) => prev.map((r) => r._id === editing._id ? updated : r));
            closeEdit();
        } catch (err: any) {
            setError(err.message || 'Failed to update reservation');
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
                My Reservations
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : reservations.length === 0 ? (
                <Alert severity="info">You have no reservations yet.</Alert>
            ) : (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    {reservations.map((res) => (
                        <Grid item xs={12} md={6} key={res._id}>
                            <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.05)', borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="h6">Table {res.tableId?.tableNumber ?? res.tableNumber ?? '—'}</Typography>
                                    <Typography color="text.secondary">Date: {res.reservationDate}</Typography>
                                    <Typography color="text.secondary">Time: {res.startTime} - {res.endTime}</Typography>
                                    <Typography color="text.secondary">Party Size: {res.partySize}</Typography>
                                    {
                                        (() => {
                                            const statusText = res.status ?? 'Confirmed';
                                            const isCancelled = ['cancelled', 'canceled'].includes((statusText || '').toString().toLowerCase());
                                            return (
                                                <Typography sx={{ mt: 1 }} color={isCancelled ? 'error.main' : 'success.main'}>
                                                    Status: {statusText}
                                                </Typography>
                                            );
                                        })()
                                    }
                                </CardContent>
                                {(() => {
                                    const statusText = res.status ?? 'Confirmed';
                                    const isCancelled = ['cancelled', 'canceled'].includes((statusText || '').toString().toLowerCase());
                                    return (
                                        <CardActions sx={{ p: 2 }}>
                                            {!isCancelled && (
                                                <>
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        onClick={() => openEdit(res)}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => handleCancel(res._id)}
                                                        disabled={actionLoading === res._id}
                                                    >
                                                        {actionLoading === res._id ? 'Cancelling...' : 'Cancel Reservation'}
                                                    </Button>
                                                </>
                                            )}
                                            {isCancelled && (
                                                <Typography color="text.secondary">This reservation is cancelled</Typography>
                                            )}
                                        </CardActions>
                                    );
                                })()}
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={editOpen} onClose={closeEdit} fullWidth maxWidth="sm">
                <DialogTitle>Edit Reservation</DialogTitle>
                <DialogContent>
                    {editing && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <TextField
                                label="Date"
                                type="date"
                                value={editing.reservationDate}
                                onChange={(e) => setEditing({ ...editing, reservationDate: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                            <TextField
                                label="Start Time"
                                type="time"
                                value={editing.startTime}
                                onChange={(e) => setEditing({ ...editing, startTime: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                            <TextField
                                label="End Time"
                                type="time"
                                value={editing.endTime}
                                onChange={(e) => setEditing({ ...editing, endTime: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                            <TextField
                                label="Party Size"
                                type="number"
                                value={editing.partySize}
                                onChange={(e) => setEditing({ ...editing, partySize: Number(e.target.value) })}
                                InputProps={{ inputProps: { min: 1 } }}
                                fullWidth
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeEdit} disabled={editLoading}>Cancel</Button>
                    <Button onClick={submitEdit} variant="contained" disabled={editLoading}>
                        {editLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
