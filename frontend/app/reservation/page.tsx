'use client';

import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    Alert,
    Paper
} from '@mui/material';
import { reservationService } from '../../services/reservationService';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ReservationPage() {
    const { user } = useAuth();
    const router = useRouter();

    // Search State
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [partySize, setPartySize] = useState(2);

    // Results State
    const [tables, setTables] = useState<any[]>([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('Please login to search for tables');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMsg('');
        setTables([]);

        try {
            const data = await reservationService.getAvailableTables(partySize, date, startTime, endTime);
            setTables(data.tables || []);
            setSearched(true);
        } catch (err: any) {
            setError(err.message || 'Failed to search tables');
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (tableId: string) => {
        if (!user) {
            router.push('/login');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await reservationService.createReservation({
                tableId,
                partySize: Number(partySize),
                reservationDate: date,
                startTime,
                endTime
            });
            setSuccessMsg('Table reserved successfully! Check your dashboard.');
            setTables([]); // Clear tables to prevent double booking or force re-search
            setSearched(false);
        } catch (err: any) {
            setError(err.message || 'Failed to book table');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
                Reserve a Table
            </Typography>

            {/* Search Form */}
            <Paper elevation={0} sx={{ p: 4, mb: 6, border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Find Availability
                </Typography>
                <Box component="form" onSubmit={handleSearch}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                fullWidth
                                label="Date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                fullWidth
                                label="Start Time"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                fullWidth
                                label="End Time"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                fullWidth
                                label="Party Size"
                                type="number"
                                value={partySize}
                                onChange={(e) => setPartySize(Number(e.target.value))}
                                inputProps={{ min: 1 }}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                                sx={{ py: 1.5 }}
                            >
                                {loading ? 'Searching...' : 'Find Tables'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            {/* Messages */}
            {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>{successMsg}</Alert>}

            {/* Results */}
            {searched && (
                <Box>
                    <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                        Available Tables ({tables.length})
                    </Typography>

                    {tables.length === 0 ? (
                        <Typography color="text.secondary">No tables found for these criteria. Please try different times.</Typography>
                    ) : (
                        <Grid container spacing={3}>
                            {tables.map((table) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={table._id}>
                                    <Card elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" gutterBottom>
                                                Table {table.tableNumber}
                                            </Typography>
                                            <Typography color="text.secondary">
                                                Capacity: {table.capacity} Guests
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                                                Location: {table.location || 'Main Hall'}
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ p: 2, pt: 0 }}>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                onClick={() => handleBook(table._id)}
                                                disabled={loading}
                                            >
                                                Book Now
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            )}
        </Container>
    );
}
