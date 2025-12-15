const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/v1/cart`;

// Type definitions for Cart
export interface CartItem {
    _id?: string; // ID of the item inside the cart array (mongoose subdocument id)
    menuItemId: {
        _id: string;
        name: string;
        price: number;
        subCategory?: string;
        image?: string;
    } | string; // Populated or ID
    quantity: number;
}

export interface Cart {
    _id: string;
    customerId?: string;
    items: CartItem[];
    totalPrice: number;
}

export const cartService = {
    async getCart() {
        try {
            const response = await fetch(`${API_URL}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.status === 404) {
                return null; // No cart yet
            }

            if (!response.ok) {
                throw new Error('Failed to fetch cart');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    },

    async addItem(menuItemId: string, quantity: number = 1) {
        try {
            const response = await fetch(`${API_URL}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ menuItemId, quantity }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add item to cart');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    },

    async removeItem(menuItemId: string) {
        try {
            const response = await fetch(`${API_URL}/items`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ menuItemId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to remove item from cart');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    },

    async updateItemQuantity(menuItemId: string, quantity: number) {
        try {
            const response = await fetch(`${API_URL}/items`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ menuItemId, quantity }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update item quantity');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    },

    async emptyCart() {
        try {
            const response = await fetch(`${API_URL}/empty`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to empty cart');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    }
};
