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
    Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { feedbackService } from '../../services/feedbackService';

export default function FeedbackManagement() {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const data = await feedbackService.getAllFeedback();
            setFeedbacks(data);
        } catch (err) {
            console.error('Failed to fetch feedback', err);
            setError('Failed to load feedback');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

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

            {feedbacks.length === 0 ? (
                <Typography color="text.secondary">No feedback available.</Typography>
            ) : (
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
            )}
        </Box>
    );
}
