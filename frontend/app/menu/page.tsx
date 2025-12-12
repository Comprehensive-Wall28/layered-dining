'use client';

import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    Box,
    Chip,
    CircularProgress,
    Tabs,
    Tab,
    Snackbar,
    Alert
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { menuService, MenuItem } from '../../services/menuService';
import { useCart } from '../../context/CartContext';

export default function MenuPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState<string[]>(['All']);
    const { addToCart } = useCart();

    // Snackbar state
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');


    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const items = await menuService.getAllMenus();
                setMenuItems(items);

                // Extract unique categories
                const uniqueCategories = ['All', ...Array.from(new Set(items.map(item => item.category)))];
                setCategories(uniqueCategories);
            } catch (error) {
                console.error('Failed to load menu', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, []);

    const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
        setSelectedCategory(newValue);
    };

    const handleAddToCart = async (item: MenuItem) => {
        try {
            await addToCart(item._id, 1);
            setSnackbarMessage(`Added ${item.name} to cart`);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            setSnackbarMessage('Failed to add to cart');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const filteredItems = selectedCategory === 'All'
        ? menuItems
        : menuItems.filter(item => item.category === selectedCategory);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                Our Menu
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    textColor="primary"
                    indicatorColor="primary"
                >
                    {categories.map((category) => (
                        <Tab key={category} label={category} value={category} />
                    ))}
                </Tabs>
            </Box>

            <Grid container spacing={4}>
                {filteredItems.map((item) => (
                    <Grid key={item._id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                            <CardMedia
                                component="img"
                                height="200"
                                image={item.image || '/placeholder-food.png'}
                                alt={item.name}
                                sx={{ objectFit: 'cover' }}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Typography gutterBottom variant="h6" component="div">
                                        {item.name}
                                    </Typography>
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        ${item.price.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {item.description}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {item.tags && item.tags.map((tag) => (
                                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                                    ))}
                                </Box>
                            </CardContent>
                            <CardActions sx={{ p: 2, pt: 0 }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<AddShoppingCartIcon />}
                                    onClick={() => handleAddToCart(item)}
                                    color="secondary"
                                >
                                    Add to Cart
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}
