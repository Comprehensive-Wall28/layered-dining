import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, Chip, CircularProgress, Box, Typography,
    Stack, IconButton, Tooltip, Menu, MenuItem, TablePagination
} from '@mui/material';
import { Edit as EditIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { authService } from '../../services/authService';

export default function OrderManagement() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await authService.getAllOrders();
            // Sort by createdAt (desc)
            const sortedData = [...data].sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setOrders(sortedData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, order: any) => {
        setAnchorEl(event.currentTarget);
        setSelectedOrder(order);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedOrder(null);
    };

    const handleStatusUpdate = async (status: string) => {
        if (!selectedOrder) return;
        try {
            await authService.updateOrderStatus(selectedOrder._id, status);
            fetchOrders();
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        } finally {
            handleMenuClose();
        }
    };

    const handleRefund = async () => {
        if (!selectedOrder) return;
        if (!confirm('Are you sure you want to refund this order?')) return;
        try {
            await authService.refundOrder(selectedOrder._id);
            fetchOrders();
        } catch (err) {
            console.error(err);
            alert('Failed to refund order');
        } finally {
            handleMenuClose();
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Order Management</Typography>
            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Items</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Payment</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rowsPerPage > 0
                            ? orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : orders
                        ).map((order) => (
                            <TableRow key={order._id}>
                                <TableCell>#{order._id.slice(-6).toUpperCase()}</TableCell>
                                <TableCell>{order.customerName}</TableCell>
                                <TableCell>
                                    {(order.items || []).map((item: any) => (
                                        <div key={item._id}>
                                            {item.quantity}x {item.menuItemId?.name || 'Unknown Item'}
                                        </div>
                                    ))}
                                </TableCell>
                                <TableCell>${(order.totalPrice || 0).toFixed(2)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={order.status}
                                        color={order.status === 'Completed' ? 'success' : order.status === 'Cancelled' ? 'error' : 'warning'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={order.paymentStatus}
                                        variant="outlined"
                                        size="small"
                                        color={order.paymentStatus === 'Paid' ? 'success' : 'default'}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, order)}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">No orders found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={orders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleStatusUpdate('Pending')}>Set Pending</MenuItem>
                <MenuItem onClick={() => handleStatusUpdate('Confirmed')}>Set Confirmed</MenuItem>
                <MenuItem onClick={() => handleStatusUpdate('Completed')}>Set Completed</MenuItem>
                <MenuItem onClick={() => handleStatusUpdate('Cancelled')} sx={{ color: 'error.main' }}>Cancel Order</MenuItem>
                {selectedOrder?.paymentStatus === 'Paid' && (
                    <MenuItem onClick={handleRefund} sx={{ color: 'warning.main' }}>Refund Order</MenuItem>
                )}
            </Menu>
        </Box>
    );
}
