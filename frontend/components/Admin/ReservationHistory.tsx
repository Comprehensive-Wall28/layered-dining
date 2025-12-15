import React, { useEffect, useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress
} from '@mui/material';
import { authService } from '../../services/authService';

export default function ReservationHistory() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editReservation, setEditReservation] = useState<any | null>(null);
    const [editForm, setEditForm] = useState({ reservationDate: '', startTime: '', partySize: '' });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const data = await authService.getMyReservations();
            setReservations(data);
        } catch (err) {
            console.error('Failed to fetch reservations', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const handleCancel = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this reservation?')) return;
        try {
            await authService.cancelReservation(id);
            fetchReservations();
        } catch (err) {
            console.error('Failed to cancel', err);
        }
    };

    const handleEditClick = (res: any) => {
        setEditReservation(res);
        setEditForm({
            reservationDate: res.reservationDate.split('T')[0],
            startTime: res.startTime,
            partySize: res.partySize
        });
    };

    const handleEditSave = async () => {
        if (!editReservation) return;
        setActionLoading(true);
        try {
            await authService.updateReservation(editReservation._id, {
                reservationDate: editForm.reservationDate,
                startTime: editForm.startTime,
                partySize: parseInt(editForm.partySize)
            });
            setEditReservation(null);
            fetchReservations();
        } catch (err) {
            console.error('Failed to update', err);
        } finally {
            setActionLoading(false);
        }
    };

    const upcoming = reservations.filter(r => new Date(r.reservationDate) >= new Date() && r.status !== 'Cancelled').sort((a, b) => new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime());
    const past = reservations.filter(r => new Date(r.reservationDate) < new Date() || r.status === 'Cancelled').sort((a, b) => new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime());

    if (loading) return <CircularProgress />;

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Upcoming Reservations</Typography>
            {upcoming.length === 0 ? <Typography color="text.secondary">No upcoming reservations.</Typography> : (
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {upcoming.map(res => (
                        <Grid size={{ xs: 12, md: 6 }} key={res._id}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {new Date(res.reservationDate).toLocaleDateString()} at {res.startTime}
                                        </Typography>
                                        <Chip label={res.status} color="primary" size="small" />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Party of {res.partySize}
                                    </Typography>
                                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                        <Button size="small" variant="outlined" onClick={() => handleEditClick(res)}>Modify</Button>
                                        <Button size="small" color="error" onClick={() => handleCancel(res._id)}>Cancel</Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Typography variant="h6" gutterBottom>Past History</Typography>
            {past.length === 0 ? <Typography color="text.secondary">No past history.</Typography> : (
                <Grid container spacing={2}>
                    {past.map(res => (
                        <Grid size={{ xs: 12, md: 6 }} key={res._id}>
                            <Card variant="outlined" sx={{ opacity: 0.7 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="subtitle1">
                                            {new Date(res.reservationDate).toLocaleDateString()}
                                        </Typography>
                                        <Chip label={res.status} size="small" />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {res.startTime} • Party of {res.partySize}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={!!editReservation} onClose={() => setEditReservation(null)}>
                <DialogTitle>Modify Reservation</DialogTitle>
                <DialogContent sx={{ pt: 2, minWidth: 300 }}>
                    <TextField
                        fullWidth
                        label="Date"
                        type="date"
                        value={editForm.reservationDate}
                        onChange={(e) => setEditForm({ ...editForm, reservationDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2, mt: 1 }}
                    />
                    <TextField
                        fullWidth
                        label="Time"
                        type="time"
                        value={editForm.startTime}
                        onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Party Size"
                        type="number"
                        value={editForm.partySize}
                        onChange={(e) => setEditForm({ ...editForm, partySize: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditReservation(null)}>Cancel</Button>
                    <Button onClick={handleEditSave} variant="contained" disabled={actionLoading}>
                        {actionLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
