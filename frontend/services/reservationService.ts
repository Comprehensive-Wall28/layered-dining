const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/v1/reservations`;

export const reservationService = {
    async getAvailableTables(partySize: number, date: string, startTime: string, endTime: string) {
        try {
            const queryParams = new URLSearchParams({
                partySize: partySize.toString(),
                reservationDate: date,
                startTime,
                endTime
            });

            const response = await fetch(`${API_URL}/available-tables?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return { tables: [] };
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch available tables');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async getUserReservations() {
        try {
            const response = await fetch(`${API_URL}/my-reservations`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch user reservations');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async getReservationById(id: string) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch reservation details');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async createReservation(data: any) {
        try {
            const response = await fetch(`${API_URL}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Reservation failed');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async cancelReservation(id: string) {
        try {
            const response = await fetch(`${API_URL}/cancel/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to cancel reservation');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }
,

    async updateReservation(id: string, data: any) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update reservation');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }
};
