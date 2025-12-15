import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, CircularProgress, Box, Typography,
    Stack, IconButton, Tooltip, TablePagination
} from '@mui/material';
import { Edit as EditIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { authService } from '../../services/authService';

export default function ReservationManagement() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editReservation, setEditReservation] = useState<any | null>(null);
    const [editForm, setEditForm] = useState({ reservationDate: '', startTime: '', partySize: '' });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const data = await authService.getAllReservations();
            // Sort by date (desc) then time (desc)
            const sortedData = [...data].sort((a, b) => {
                const dateA = new Date(a.reservationDate).getTime();
                const dateB = new Date(b.reservationDate).getTime();
                if (dateA !== dateB) return dateB - dateA;
                return b.startTime.localeCompare(a.startTime);
            });
            setReservations(sortedData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
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
            alert('Failed to update reservation');
        }
    };

    const handleCancelClick = (id: string) => {
        setDeleteId(id);
    };

    const handleCancelConfirm = async () => {
        if (!deleteId) return;
        try {
            await authService.cancelReservation(deleteId);
            setDeleteId(null);
            fetchReservations();
        } catch (err) {
            console.error(err);
            alert('Failed to cancel reservation');
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Reservation Management</Typography>
            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Table</TableCell>
                            <TableCell>Party</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rowsPerPage > 0
                            ? reservations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : reservations
                        ).map((res) => (
                            <TableRow key={res._id}>
                                <TableCell>{new Date(res.reservationDate).toLocaleDateString()}</TableCell>
                                <TableCell>{res.startTime}</TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="bold">{res.customerName}</Typography>
                                    <Typography variant="caption" color="text.secondary">{res.customerEmail}</Typography>
                                </TableCell>
                                <TableCell>{res.tableId?.tableNumber || 'N/A'}</TableCell>
                                <TableCell>{res.partySize}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={res.status}
                                        color={res.status === 'Confirmed' ? 'success' : res.status === 'Cancelled' ? 'error' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <Tooltip title="Modify">
                                            <IconButton size="small" onClick={() => handleEditClick(res)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Cancel">
                                            <IconButton size="small" color="error" onClick={() => handleCancelClick(res._id)}>
                                                <CancelIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                        {reservations.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">No reservations found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={reservations.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
                <DialogTitle>Confirm Cancellation</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to cancel this reservation? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteId(null)}>No, Keep it</Button>
                    <Button onClick={handleCancelConfirm} color="error" variant="contained">Yes, Cancel Reservation</Button>
                </DialogActions>
            </Dialog>

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
                    <Button onClick={handleEditSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
