'use client';

import React from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Button,
    Divider,
    Stack,
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CartDrawer() {
    const { cart, isCartOpen, toggleCart, updateQuantity, removeFromCart, isLoading, clearCart } = useCart();
    const router = useRouter();

    const handleClose = () => {
        toggleCart(false);
    };

    const handleCheckout = () => {
        toggleCart(false);
        router.push('/checkout');
    };

    // Helper to safely get item details whether populated or not
    const getItemDetails = (item: any) => {
        if (typeof item.menuItemId === 'object') {
            return item.menuItemId;
        }
        return { name: 'Unknown Item', price: 0, image: '' };
    };

    return (
        <Drawer
            anchor="right"
            open={isCartOpen}
            onClose={handleClose}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 400 } }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header */}
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'white' }}>
                    <Typography variant="h6">Your Order</Typography>
                    <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Content */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {isLoading && !cart ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : !cart || cart.items.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                Your cart is empty.
                            </Typography>
                            <Button variant="outlined" component={Link} href="/menu" onClick={handleClose}>
                                Browse Menu
                            </Button>
                        </Box>
                    ) : (
                        <List>
                            {cart.items.map((item) => {
                                const details = getItemDetails(item);
                                return (
                                    <React.Fragment key={item._id || details._id}>
                                        <ListItem alignItems="flex-start" secondaryAction={
                                            <IconButton edge="end" aria-label="delete" onClick={() => removeFromCart(details._id)}>
                                                <DeleteOutlineIcon color="error" />
                                            </IconButton>
                                        }>
                                            <ListItemAvatar>
                                                <Avatar alt={details.name} src={details.image || '/placeholder-food.png'} variant="rounded" sx={{ width: 56, height: 56, mr: 2 }} />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={details.name}
                                                secondaryTypographyProps={{ component: 'div' }}
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography variant="body2" color="text.primary" component="span">
                                                            ${details.price.toFixed(2)}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                            <IconButton size="small" onClick={() => updateQuantity(details._id, item.quantity - 1)} disabled={item.quantity <= 1}>
                                                                <RemoveIcon fontSize="small" />
                                                            </IconButton>
                                                            <Typography variant="body2" sx={{ mx: 1 }} component="span">{item.quantity}</Typography>
                                                            <IconButton size="small" onClick={() => updateQuantity(details._id, item.quantity + 1)}>
                                                                <AddIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    </React.Fragment>
                                                }
                                            />
                                        </ListItem>
                                        <Divider component="li" />
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    )}
                </Box>

                {/* Footer */}
                {cart && cart.items.length > 0 && (
                    <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1">Subtotal:</Typography>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    ${cart.totalPrice.toFixed(2)}
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                color="secondary"
                                size="large"
                                fullWidth
                                startIcon={<ShoppingCartCheckoutIcon />}
                                onClick={handleCheckout}
                            >
                                Checkout
                            </Button>
                            <Button
                                variant="text"
                                color="error"
                                size="small"
                                fullWidth
                                onClick={clearCart}
                            >
                                Clear Cart
                            </Button>
                        </Stack>
                    </Box>
                )}
            </Box>
        </Drawer>
    );
}
