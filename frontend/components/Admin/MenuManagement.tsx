'use client';

import React, { useEffect, useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    Chip,
    TextField,
    CircularProgress,
    Tooltip
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { menuService, MenuItem } from '../../services/menuService';

export default function MenuManagement() {
    const router = useRouter();
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [page, setPage] = useState(1);

    const fetchMenus = async () => {
        setLoading(true);
        try {
            // Fetch all menus (filtering by search would ideally happen server-side, 
            // but for now we'll filter client-side if API doesn't support search param)
            const data = await menuService.getAllMenus();
            setMenus(data);
        } catch (error) {
            console.error('Failed to fetch menus:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    const handleDelete = async () => {
        if (!deleteId) return;
        setActionLoading(true);
        try {
            await menuService.deleteMenu(deleteId);
            setDeleteId(null);
            fetchMenus();
        } catch (error) {
            console.error('Failed to delete menu item:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const filteredMenus = menus.filter(menu =>
        menu.name.toLowerCase().includes(search.toLowerCase()) ||
        menu.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Menu Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/admin/menu/new')}
                >
                    Add Item
                </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Search menu items..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.05)' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredMenus
                                .slice((page - 1) * 5, page * 5)
                                .map((menu) => (
                                    <TableRow key={menu._id} hover>
                                        <TableCell>{menu.name}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={menu.category}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>${menu.price.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={menu.isAvailable ? 'Available' : 'Unavailable'}
                                                color={menu.isAvailable ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => router.push(`/admin/menu/${menu._id}`)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => setDeleteId(menu._id)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {filteredMenus.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                        No menu items found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center', mt: 2 }}>
                <Button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    variant="outlined"
                >
                    Previous
                </Button>
                <Typography variant="body2">
                    Page {page} of {Math.max(1, Math.ceil(filteredMenus.length / 5))}
                </Typography>
                <Button
                    disabled={page >= Math.ceil(filteredMenus.length / 5)}
                    onClick={() => setPage(p => p + 1)}
                    variant="outlined"
                >
                    Next
                </Button>
            </Box>

            {/* Delete Confirmation Dialog */}
            {deleteId && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <Paper sx={{ p: 4, maxWidth: 400 }}>
                        <Typography variant="h6" gutterBottom>Confirm Delete</Typography>
                        <Typography gutterBottom>Are you sure you want to delete this menu item?</Typography>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button onClick={() => setDeleteId(null)} disabled={actionLoading}>Cancel</Button>
                            <Button variant="contained" color="error" onClick={handleDelete} disabled={actionLoading}>
                                {actionLoading ? 'Deleting...' : 'Delete'}
                            </Button>
                        </Box>
                    </Paper>
                </div>
            )}
        </Box>
    );
}
