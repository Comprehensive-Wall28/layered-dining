const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/v1/tables`;

export interface Table {
    _id: string;
    tableNumber: number;
    capacity: number;
    location: 'Indoor' | 'Outdoor' | 'Patio' | 'Private Room' | 'Bar Area';
    status: 'Available' | 'Occupied' | 'Maintenance';
    features: string[];
    createdBy?: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    createdAt: string;
    updatedAt: string;
}

export const tableService = {
    async getAllTables(): Promise<Table[]> {
        try {
            const response = await fetch(`${API_URL}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch tables');
            }

            const data = await response.json();
            return data.tables;
        } catch (error) {
            throw error;
        }
    },

    async getMyTables(): Promise<Table[]> {
        try {
            const response = await fetch(`${API_URL}/my-tables`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch my tables');
            }

            const data = await response.json();
            return data.tables;
        } catch (error) {
            throw error;
        }
    },

    async getTableById(id: string): Promise<Table> {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch table details');
            }

            const data = await response.json();
            return data.table;
        } catch (error) {
            throw error;
        }
    },

    async createTable(data: Partial<Table>): Promise<Table> {
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
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create table');
            }

            const responseData = await response.json();
            return responseData.table;
        } catch (error) {
            throw error;
        }
    },

    async updateTable(id: string, data: Partial<Table>): Promise<Table> {
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
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update table');
            }

            const responseData = await response.json();
            return responseData.table;
        } catch (error) {
            throw error;
        }
    },

    async deleteTable(id: string): Promise<{ message: string; tableNumber: number }> {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to delete table');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }
};
