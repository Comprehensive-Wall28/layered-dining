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
    }
};
