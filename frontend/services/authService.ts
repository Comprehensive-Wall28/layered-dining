const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/v1/auth`;
const API_URL_USER = `${API_BASE_URL}/api/v1/user`;
const API_URL_RESERVATION = `${API_BASE_URL}/api/v1/reservations`;

export const authService = {
    async login(data: any) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async register(data: any) {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async logout() {
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error("Logout failed", error);
        }
    },

    async getCurrentUser() {
        try {
            const response = await fetch(`${API_URL_USER}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                // If 401 or 403, simply return null (not authenticated)
                if (response.status === 401 || response.status === 403) {
                    return null;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch user');
            }

            const data = await response.json();
            // The controller returns { status: 'success', user: ... }
            return data.user;
        } catch (error) {
            console.error("Get Current User failed", error);
            return null;
        }
    },

    async getAllUsers(params: { page?: number; limit?: number; search?: string } = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());
            if (params.search) queryParams.append('search', params.search);

            const response = await fetch(`${API_URL_USER}/all?${queryParams.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch users');
            }

            return await response.json();
        } catch (error) {
            console.error("Get All Users failed", error);
            throw error;
        }
    },

    async deleteUser(id: string) {
        try {
            const response = await fetch(`${API_URL_USER}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user');
            }

            return await response.json();
        } catch (error) {
            console.error("Delete User failed", error);
            throw error;
        }
    },

    async updateUser(id: string, data: any) {
        try {
            const response = await fetch(`${API_URL_USER}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user');
            }

            return await response.json();
        } catch (error) {
            console.error("Update User failed", error);
            throw error;
        }
    },

    async getStats() {
        try {
            const response = await fetch(`${API_URL_USER}/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch stats');
            }

            const data = await response.json();
            return data.stats;
        } catch (error) {
            console.error("Get Stats failed", error);
            throw error;
        }
    },

    async getMyReservations() {
        try {
            const response = await fetch(`${API_URL_RESERVATION}/my-reservations`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch reservations');
            const data = await response.json();
            return data.reservations;
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async updateReservation(id: string, data: any) {
        const response = await fetch(`${API_URL_RESERVATION}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to update reservation');
        return await response.json();
    },

    async cancelReservation(id: string) {
        const response = await fetch(`${API_URL_RESERVATION}/cancel/${id}`, {
            method: 'PUT',
            credentials: 'include'
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Cancel reservation failed:', response.status, response.statusText, errorText);
            throw new Error(`Failed to cancel reservation: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    },
    async getAllReservations(filters: any = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.date) queryParams.append('date', filters.date);

            const response = await fetch(`${API_URL_RESERVATION}/all?${queryParams.toString()}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Fetch reservations failed:', response.status, response.statusText, errorText);
                throw new Error(`Failed to fetch all reservations: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return data.reservations;
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async updateReservationStatus(id: string, status: string) {
        const response = await fetch(`${API_URL_RESERVATION}/status/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
            credentials: 'include'
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Update reservation status failed:', response.status, response.statusText, errorText);
            throw new Error(`Failed to update reservation status: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    },

    async getAllOrders() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/orders`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch orders');
            const data = await response.json();
            return data.data; // API returns { success: true, data: [...] }
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async updateOrderStatus(id: string, status: string, paymentStatus?: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/orders/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, paymentStatus }),
            credentials: 'include'
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Update order status failed:', response.status, response.statusText, errorText);
            throw new Error(`Failed to update order status: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    },

    async refundOrder(id: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/orders/${id}/refund`, {
            method: 'POST',
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to refund order');
        return await response.json();
    }
};
