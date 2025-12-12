const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/v1/orders`;

export const orderService = {
    async getOrdersByCustomerId(customerId: string) {
        try {
            const response = await fetch(`${API_URL}/customer/${customerId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch orders');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }
};
