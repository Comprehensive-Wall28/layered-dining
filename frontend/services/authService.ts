const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/v1/auth`;
const API_URL_USER = `${API_BASE_URL}/api/v1/user`;

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
    }
};
