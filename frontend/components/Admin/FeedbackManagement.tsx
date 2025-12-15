'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Rating,
    IconButton,
    CircularProgress,
    Stack,
    Tooltip,
    TablePagination
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { feedbackService } from '../../services/feedbackService';

export default function FeedbackManagement() {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            // API expects 1-based index
            const data = await feedbackService.getAllFeedback(page + 1, rowsPerPage);
            console.log('Fethed feedback data:', data);

            let items = [];
            let total = 0;

            if (data.feedback && Array.isArray(data.feedback)) {
                items = data.feedback;
                total = data.total;
            } else if (data.result) {
                if (Array.isArray(data.result)) {
                    items = data.result;
                    total = data.result.length;
                } else if (data.result.feedback && Array.isArray(data.result.feedback)) {
                    items = data.result.feedback;
                    total = data.result.total;
                }
            }

            setFeedbacks(items || []);
            setTotalCount(total || 0);
        } catch (err) {
            console.error('Failed to fetch feedback', err);
            setError('Failed to load feedback');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, [page, rowsPerPage]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this feedback?')) return;
        try {
            await feedbackService.deleteFeedback(id);
            setFeedbacks(feedbacks.filter(f => f._id !== id));
        } catch (err) {
            console.error('Failed to delete feedback', err);
            alert('Failed to delete feedback');
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Customer Feedback
            </Typography>

            {(feedbacks || []).length === 0 ? (
                <Typography color="text.secondary">No feedback available.</Typography>
            ) : (
                <>
                    <Stack spacing={2}>
                        {feedbacks.map((item) => (
                            <Paper
                                key={item._id}
                                elevation={0}
                                sx={{
                                    p: 2,
                                    border: '1px solid rgba(0, 0, 0, 0.05)',
                                    borderRadius: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            {item.userId ? (item.userId.name || item.userId.email) : 'Unknown User'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Tooltip title="Delete Feedback">
                                        <IconButton size="small" color="error" onClick={() => handleDelete(item._id)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                <Rating value={item.rating} readOnly size="small" />

                                <Typography variant="body2">
                                    {item.feedback}
                                </Typography>
                            </Paper>
                        ))}
                    </Stack>
                    <TablePagination
                        component="div"
                        count={totalCount}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </>
            )}
        </Box>
    );
}
