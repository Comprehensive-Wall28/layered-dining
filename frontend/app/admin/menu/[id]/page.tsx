'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem as MuiMenuItem,
    FormControlLabel,
    Switch,
    CircularProgress,
    Stack,
    Divider
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { menuService, MenuItem } from '../../../../services/menuService';

const CATEGORIES = ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish'];

export default function MenuEditPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const isNew = id === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState<any>({
        name: '',
        description: '',
        price: '',
        category: 'Main Course',
        image: '',
        ingredients: [],
        preparationTime: '',
        tags: [],
        isAvailable: true
    });

    // Helper for array inputs
    const [ingredientsInput, setIngredientsInput] = useState('');
    const [tagsInput, setTagsInput] = useState('');

    useEffect(() => {
        if (!isNew) {
            const fetchMenu = async () => {
                try {
                    const data = await menuService.getMenuById(id);
                    setFormData(data);
                    setIngredientsInput(data.ingredients.join(', '));
                    setTagsInput(data.tags.join(', '));
                } catch (err: any) {
                    setError('Failed to load menu item');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchMenu();
        }
    }, [isNew, id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (e: any) => { // SelectChangeEvent is generic, simplified here
        setFormData((prev: any) => ({ ...prev, category: e.target.value }));
    };

    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev: any) => ({ ...prev, isAvailable: e.target.checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const dataToSave = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                preparationTime: parseFloat(formData.preparationTime) || 0,
                ingredients: ingredientsInput.split(',').map(s => s.trim()).filter(Boolean),
                tags: tagsInput.split(',').map(s => s.trim()).filter(Boolean)
            };

            if (isNew) {
                await menuService.createMenu(dataToSave);
            } else {
                await menuService.updateMenu(id, dataToSave);
            }
            router.push('/admin');
        } catch (err: any) {
            setError(err.message || 'Failed to save menu item');
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/admin')}
                sx={{ mb: 4 }}
            >
                Back to Dashboard
            </Button>

            <Paper sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
                    {isNew ? 'Create New Menu Item' : 'Edit Menu Item'}
                </Typography>

                {error && (
                    <Typography color="error" sx={{ mb: 3 }}>
                        {error}
                    </Typography>
                )}

                <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        <TextField
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            fullWidth
                            multiline
                            rows={3}
                        />

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                            <TextField
                                label="Price ($)"
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                fullWidth
                                inputProps={{ min: 0, step: 0.01 }}
                            />

                            <FormControl fullWidth required>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={formData.category}
                                    label="Category"
                                    onChange={handleSelectChange}
                                >
                                    {CATEGORIES.map(cat => (
                                        <MuiMenuItem key={cat} value={cat}>{cat}</MuiMenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>

                        <TextField
                            label="Image URL"
                            name="image"
                            value={formData.image || ''}
                            onChange={handleChange}
                            fullWidth
                            helperText="Optional URL to an image"
                        />

                        <TextField
                            label="Ingredients (comma separated)"
                            value={ingredientsInput}
                            onChange={(e) => setIngredientsInput(e.target.value)}
                            fullWidth
                            helperText="e.g. Flour, Sugar, Eggs"
                        />

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                            <TextField
                                label="Preparation Time (minutes)"
                                name="preparationTime"
                                type="number"
                                value={formData.preparationTime}
                                onChange={handleChange}
                                fullWidth
                            />

                            <TextField
                                label="Tags (comma separated)"
                                value={tagsInput}
                                onChange={(e) => setTagsInput(e.target.value)}
                                fullWidth
                                helperText="e.g. Vegan, Spicy, Gluten-Free"
                            />
                        </Stack>

                        <Divider />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isAvailable}
                                    onChange={handleSwitchChange}
                                    color="primary"
                                />
                            }
                            label="Available for ordering"
                        />

                        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                onClick={() => router.push('/admin')}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={saving}

                            >
                                {saving ? 'Saving...' : 'Save Item'}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
}
