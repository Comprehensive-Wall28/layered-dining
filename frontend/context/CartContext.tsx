'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartService, Cart, CartItem } from '../services/cartService';
import { useAuth } from './AuthContext';

interface CartContextType {
    cart: Cart | null;
    itemsCount: number;
    isLoading: boolean;
    addToCart: (menuItemId: string, quantity?: number) => Promise<void>;
    removeFromCart: (menuItemId: string) => Promise<void>;
    updateQuantity: (menuItemId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
    isCartOpen: boolean;
    toggleCart: (open?: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { user } = useAuth(); // Assume AuthContext provides user object

    const refreshCart = async () => {
        if (!user) {
            setCart(null);
            return;
        }

        try {
            // Don't set global loading state for background refreshes to avoid ui flickering
            // But for initial load it might be useful.
            const data = await cartService.getCart();
            setCart(data);
        } catch (error) {
            console.error('Failed to fetch cart', error);
            // If 404/null, it's fine, cart is empty.
        }
    };

    // Initial load when user changes
    useEffect(() => {
        if (user) {
            setIsLoading(true);
            refreshCart().finally(() => setIsLoading(false));
        } else {
            setCart(null);
        }
    }, [user]);

    const addToCart = async (menuItemId: string, quantity: number = 1) => {
        if (!user) {
            // Ideally show login modal or redirect. For now alert.
            alert('Please log in to add items to cart.');
            return;
        }
        try {
            const updatedCart = await cartService.addItem(menuItemId, quantity);
            setCart(updatedCart);
            setIsCartOpen(true); // Open cart to show success
        } catch (error) {
            console.error('Add to cart failed', error);
            throw error; // Re-throw so component knows it failed
        }
    };

    const removeFromCart = async (menuItemId: string) => {
        try {
            const updatedCart = await cartService.removeItem(menuItemId);
            setCart(updatedCart);
        } catch (error) {
            console.error('Remove from cart failed', error);
        }
    };

    const updateQuantity = async (menuItemId: string, quantity: number) => {
        try {
            const updatedCart = await cartService.updateItemQuantity(menuItemId, quantity);
            setCart(updatedCart);
        } catch (error) {
            console.error('Update quantity failed', error);
        }
    };

    const clearCart = async () => {
        try {
            const updatedCart = await cartService.emptyCart();
            setCart(updatedCart);
        } catch (error) {
            console.error('Clear cart failed', error);
        }
    };

    const toggleCart = (open?: boolean) => {
        setIsCartOpen((prev) => open !== undefined ? open : !prev);
    };

    const itemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

    return (
        <CartContext.Provider
            value={{
                cart,
                itemsCount,
                isLoading,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                refreshCart,
                isCartOpen,
                toggleCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
