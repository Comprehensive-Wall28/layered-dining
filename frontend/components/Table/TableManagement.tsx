import React, { useEffect, useState } from 'react';
import {
    Table as MuiTable, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, CircularProgress, Box, Typography,
    Stack, IconButton, Tooltip, TablePagination
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { tableService, Table } from '../../services/tableService';
import { authService } from '../../services/authService';
import TableForm from './TableForm';

export default function TableManagement() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchTables = async () => {
        setLoading(true);
        try {
            const data = await tableService.getAllTables();
            setTables(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUser = async () => {
        try {
            const user = await authService.getCurrentUser();
            setCurrentUser(user);
        } catch (err) {
            console.error('Failed to fetch user', err);
        }
    };

    useEffect(() => {
        fetchTables();
        fetchUser();
    }, []);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleCreateClick = () => {
        setEditingTable(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (table: Table) => {
        setEditingTable(table);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const handleFormSubmit = async (data: Partial<Table>) => {
        try {
            if (editingTable) {
                await tableService.updateTable(editingTable._id, data);
            } else {
                await tableService.createTable(data);
            }
            setIsFormOpen(false);
            fetchTables();
        } catch (err: any) {
            console.error('Failed to save table', err);
            alert(err.message || 'Failed to save table');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteId) return;
        try {
            await tableService.deleteTable(deleteId);
            setDeleteId(null);
            fetchTables();
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Failed to delete table');
        }
    };



    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Table Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateClick}
                >
                    Add Table
                </Button>
            </Stack>

            <TableContainer component={Paper} variant="outlined">
                <MuiTable>
                    <TableHead>
                        <TableRow>
                            <TableCell>Table No.</TableCell>
                            <TableCell>Capacity</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Features</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rowsPerPage > 0
                            ? (tables || []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : (tables || [])
                        ).map((table) => (
                            <TableRow key={table._id}>
                                <TableCell>{table.tableNumber}</TableCell>
                                <TableCell>{table.capacity}</TableCell>
                                <TableCell>{table.location}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={table.status}
                                        color={
                                            table.status === 'Available' ? 'success' :
                                                table.status === 'Occupied' ? 'error' : 'warning'
                                        }
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                        {table.features?.map((feature, idx) => (
                                            <Chip key={idx} label={feature} size="small" variant="outlined" sx={{ my: 0.5 }} />
                                        ))}
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <Tooltip title="Edit">
                                            <IconButton size="small" onClick={() => handleEditClick(table)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        {['admin', 'manager'].includes(currentUser?.role?.toLowerCase()) && (
                                            <Tooltip title="Delete">
                                                <IconButton size="small" color="error" onClick={() => handleDeleteClick(table._id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                        {tables.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No tables found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </MuiTable>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={tables.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <TableForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingTable}
                title={editingTable ? 'Edit Table' : 'Add New Table'}
            />

            <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this table? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteId(null)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
