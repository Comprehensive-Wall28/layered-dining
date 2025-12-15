const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/v1/user/feedback`;

export const feedbackService = {
    async submitFeedback(feedback: string, rating: number) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ feedback, rating }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit feedback');
            }

            return await response.json();
        } catch (error) {
            console.error("Submit Feedback failed", error);
            throw error;
        }
    },

    async getAllFeedback(page = 1, limit = 5) {
        try {
            const response = await fetch(`${API_URL}?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch feedback');
            }

            return await response.json();
        } catch (error) {
            console.error("Get All Feedback failed", error);
            throw error;
        }
    },

    async deleteFeedback(id: string) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete feedback');
            }

            return await response.json();
        } catch (error) {
            console.error("Delete Feedback failed", error);
            throw error;
        }
    }
};
