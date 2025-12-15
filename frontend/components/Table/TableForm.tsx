import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, FormControl, InputLabel, Select,
    MenuItem, Box, FormGroup, FormControlLabel, Checkbox
} from '@mui/material';
import { Table } from '../../services/tableService';

interface TableFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Table>) => Promise<void>;
    initialData?: Table | null;
    title: string;
}

const LOCATIONS = ['Indoor', 'Outdoor', 'Patio', 'Private Room', 'Bar Area'];
const STATUSES = ['Available', 'Occupied', 'Maintenance'];
const FEATURES = ['Window View', 'Wheelchair Accessible', 'Quiet Area', 'Near Kitchen', 'Near Entrance'];

export default function TableForm({ open, onClose, onSubmit, initialData, title }: TableFormProps) {
    const [formData, setFormData] = useState<Partial<Table>>({
        tableNumber: undefined,
        capacity: undefined,
        location: 'Indoor',
        status: 'Available',
        features: []
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                tableNumber: initialData.tableNumber,
                capacity: initialData.capacity,
                location: initialData.location,
                status: initialData.status,
                features: initialData.features || []
            });
        } else {
            setFormData({
                tableNumber: undefined,
                capacity: undefined,
                location: 'Indoor',
                status: 'Available',
                features: []
            });
        }
    }, [initialData, open]);

    const handleChange = (field: keyof Table, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFeatureChange = (feature: string, checked: boolean) => {
        setFormData(prev => {
            const features = prev.features || [];
            if (checked) {
                return { ...prev, features: [...features, feature] };
            } else {
                return { ...prev, features: features.filter(f => f !== feature) };
            }
        });
    };

    const handleSubmit = () => {
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <TextField
                        label="Table Number"
                        type="number"
                        value={formData.tableNumber || ''}
                        onChange={(e) => handleChange('tableNumber', parseInt(e.target.value))}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Capacity"
                        type="number"
                        value={formData.capacity || ''}
                        onChange={(e) => handleChange('capacity', parseInt(e.target.value))}
                        fullWidth
                        required
                    />
                    <FormControl fullWidth>
                        <InputLabel>Location</InputLabel>
                        <Select
                            value={formData.location || 'Indoor'}
                            label="Location"
                            onChange={(e) => handleChange('location', e.target.value)}
                        >
                            {LOCATIONS.map(loc => (
                                <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={formData.status || 'Available'}
                            label="Status"
                            onChange={(e) => handleChange('status', e.target.value)}
                        >
                            {STATUSES.map(stat => (
                                <MenuItem key={stat} value={stat}>{stat}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl component="fieldset">
                        <InputLabel shrink sx={{ position: 'relative', transform: 'none', mb: 1 }}>Features</InputLabel>
                        <FormGroup row>
                            {FEATURES.map(feature => (
                                <FormControlLabel
                                    key={feature}
                                    control={
                                        <Checkbox
                                            checked={(formData.features || []).includes(feature)}
                                            onChange={(e) => handleFeatureChange(feature, e.target.checked)}
                                        />
                                    }
                                    label={feature}
                                />
                            ))}
                        </FormGroup>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}
