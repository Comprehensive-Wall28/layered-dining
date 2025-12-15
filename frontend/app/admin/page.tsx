'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Container,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Avatar,
    Grid,
    Divider,
    Button,
    TextField,
    Stack,
    IconButton,
    Tooltip,
    Tabs,
    Tab
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { authService } from '../../services/authService';
import StatsGraph from '../../components/Admin/StatsGraph';
import ReservationManagement from '../../components/Admin/ReservationManagement';
import OrderManagement from '../../components/Admin/OrderManagement';
import MenuManagement from '../../components/Admin/MenuManagement';
import FeedbackManagement from '../../components/Admin/FeedbackManagement';
import TableManagement from '../../components/Table/TableManagement';

export default function AdminDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = await authService.getCurrentUser();
                if (!userData) {
                    router.replace('/login');
                } else if (userData.role !== 'Admin') {
                    // Redirect non-admins to their appropriate dashboard if they try to access this
                    if (userData.role === 'Manager') {
                        router.replace('/manager');
                    } else {
                        router.replace('/dashboard');
                    }
                } else {
                    setUser(userData);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                router.replace('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleLogout = async () => {
        await authService.logout();
        router.replace('/login');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
                Admin Dashboard
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin dashboard tabs">
                    <Tab label="Statistics" />
                    <Tab label="Management" />
                    <Tab label="Details" />
                </Tabs>
            </Box>

            {/* Statistics Tab */}
            <div role="tabpanel" hidden={tabValue !== 0}>
                {tabValue === 0 && (
                    <Box sx={{ p: 0 }}>
                        <StatsGraph />
                    </Box>
                )}
            </div>

            {/* Management Tab */}
            <div role="tabpanel" hidden={tabValue !== 1}>
                {tabValue === 1 && (
                    <Box sx={{ p: 0 }}>
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12 }}>
                                <UserTable />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                        borderRadius: 3,
                                    }}
                                >
                                    <ReservationManagement />
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                        borderRadius: 3,
                                    }}
                                >
                                    <OrderManagement />
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                        borderRadius: 3,
                                    }}
                                >
                                    <MenuManagement />
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                        borderRadius: 3,
                                    }}
                                >
                                    <FeedbackManagement />
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                        borderRadius: 3,
                                    }}
                                >
                                    <TableManagement />
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </div>

            {/* Details Tab */}
            <div role="tabpanel" hidden={tabValue !== 2}>
                {tabValue === 2 && (
                    <Box sx={{ p: 0 }}>
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                        borderRadius: 3,
                                        textAlign: 'center'
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            bgcolor: 'primary.main',
                                            fontSize: '3rem',
                                            margin: '0 auto',
                                            mb: 2
                                        }}
                                    >
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                    </Avatar>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {user.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {user.role}
                                    </Typography>

                                    <Divider sx={{ my: 3 }} />

                                    <Box sx={{ mb: 3, textAlign: 'left' }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Email Address
                                        </Typography>
                                        <Typography variant="body1">
                                            {user.email}
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={handleLogout}
                                        sx={{ mt: 2, width: '100%' }}
                                    >
                                        Sign Out
                                    </Button>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </div>
        </Container >
    );
}

function UserTable() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [error, setError] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editUser, setEditUser] = useState<any | null>(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await authService.getAllUsers({ page, limit: 5, search });
            setUsers(data.users);
            setPages(data.pages);
        } catch (err: any) {
            setError('Failed to load users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [page, search]);

    const handleDelete = async () => {
        if (!deleteId) return;
        setActionLoading(true);
        try {
            await authService.deleteUser(deleteId);
            setDeleteId(null);
            fetchUsers();
        } catch (err) {
            console.error('Failed to delete user', err);
            // In a real app we would show a toast/alert here
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditClick = (user: any) => {
        setEditUser(user);
        setEditForm({ name: user.name, email: user.email, role: user.role });
    };

    const handleEditSave = async () => {
        if (!editUser) return;
        setActionLoading(true);
        try {
            await authService.updateUser(editUser._id, editForm);
            setEditUser(null);
            fetchUsers();
        } catch (err) {
            console.error('Failed to update user', err);
            // In a real app we would show a toast/alert here
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 4,
                border: '1px solid rgba(0, 0, 0, 0.05)',
                borderRadius: 3,
            }}
        >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                User Management
            </Typography>

            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Box>

            {loading && <CircularProgress size={24} sx={{ mb: 2 }} />}
            {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

            {!loading && !error && (
                <>
                    <Box sx={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                                    <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Name</th>
                                    <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Email</th>
                                    <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Role</th>
                                    <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Join Date</th>
                                    <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                        <td style={{ padding: '12px' }}>{u.name}</td>
                                        <td style={{ padding: '12px' }}>{u.email}</td>
                                        <td style={{ padding: '12px' }}>{u.role}</td>
                                        <td style={{ padding: '12px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '12px' }}>
                                            <Stack direction="row" spacing={1}>
                                                <Tooltip title="Modify User">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEditClick(u)}
                                                        color="primary"
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete User">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => setDeleteId(u._id)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center' }}>
                        <Button disabled={page === 1} onClick={() => setPage(p => p - 1)} variant="outlined">Previous</Button>
                        <Typography variant="body2">Page {page} of {pages}</Typography>
                        <Button disabled={page >= pages} onClick={() => setPage(p => p + 1)} variant="outlined">Next</Button>
                    </Box>
                </>
            )}

            {/* Delete Confirmation Dialog */}
            {deleteId && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <Paper sx={{ p: 4, maxWidth: 400 }}>
                        <Typography variant="h6" gutterBottom>Confirm Delete</Typography>
                        <Typography gutterBottom>Are you sure you want to delete this user? This action cannot be undone.</Typography>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button onClick={() => setDeleteId(null)} disabled={actionLoading}>Cancel</Button>
                            <Button variant="contained" color="error" onClick={handleDelete} disabled={actionLoading}>
                                {actionLoading ? 'Deleting...' : 'Delete'}
                            </Button>
                        </Box>
                    </Paper>
                </div>
            )}

            {/* Edit Dialog */}
            {editUser && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <Paper sx={{ p: 4, width: 400 }}>
                        <Typography variant="h6" gutterBottom>Modify User</Typography>
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Role (Customer, Manager, Admin)"
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            helperText="Type exact role name"
                        />
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button onClick={() => setEditUser(null)} disabled={actionLoading}>Cancel</Button>
                            <Button variant="contained" onClick={handleEditSave} disabled={actionLoading}>
                                {actionLoading ? 'Saving...' : 'Save'}
                            </Button>
                        </Box>
                    </Paper>
                </div>
            )}
        </Paper>
    );
}
