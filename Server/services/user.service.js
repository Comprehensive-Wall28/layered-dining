const UserModel = require('../models/user');
const LogModel = require('../models/log');
const FeedbackModel = require('../models/feedback');
const OrderModel = require('../models/order');
const ReservationModel = require('../models/reservation');

const customerService = {

    /**
     * Delete user account
     * @param {ID} id - The user's ID.
     * @returns {string} The deleted user's details
     * @throws {Error} If user not found
     */
    async deleteAccount(id) {

        const deletedUser = await UserModel.findByIdAndDelete(id)

        if (!deletedUser) {
            const error = new Error('User not found');
            error.code = 404;
            throw error;
        }
        const log = new LogModel({
            action: 'DELETE',
            description: 'User deleted successfully',
            severity: 'NOTICE',
            type: 'SUCCESS',
            userId: deletedUser._id,
        });
        await log.save();
        return {
            id: deletedUser._id,
            name: deletedUser.name,
            email: deletedUser.email,
            message: 'User deleted successfully'
        }
    },
    /**
     * Get user account
     * @param {ID} id - The user's ID.
     * @returns {string} The user's details
     * @throws {Error} If user not found or ID not provided
     */
    //TODO: ADD PROTECTION ON WHO GETS THE DETAILS
    async getCurrentUser(id) {

        if (!id) {
            const error = new Error('No ID provided');
            error.code = 400;
            throw error;
        }
        const user = await UserModel.findById(id);

        if (!user) {
            const error = new Error('User not found');
            error.code = 404;
            throw error;
        }
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    },
    /**
     * Update user account details, not all parameters are required, only one is.
     * @param {ID} id - The user's ID.
     * @param {NAME} name - The user's new name
     * @param {EMAIL} email - The user's new Email
     * @param {PASSWORD} password - The user's new Password
     * @returns {string} Confirmation
     * @throws {Error} If user not found or parameters not provided
     */
    async updateUserProfile(id, name, email, password) {
        //get the user
        const user = await UserModel.findById(id);
        modifiedParameters = [];

        if (!user) {
            const error = new Error('User not found');
            error.code = 404;
            throw error;
        }
        if (name) {
            user.name = name;
            modifiedParameters.push('NAME');
        }
        if (email) {
            user.email = email;
            modifiedParameters.push('EMAIL');
        }
        if (password) {
            user.password = password;
            modifiedParameters.push('PASSWORD');
        }
        await user.save(); //Save the user

        if (modifiedParameters.length > 0) {
            const log = new LogModel({
                action: 'UPDATE',
                description: 'User updated: ' + modifiedParameters,
                severity: 'NOTICE',
                type: 'SUCCESS',
                userId: user._id,
            });
            await log.save();
        }

        return {
            modifiedParameters: modifiedParameters,
            message: 'User updated successfully!'
        }
    },
    /**
     * Get logs attached to user ID
     * @param {ID} id - The user's ID.
     * @returns {string} Logs
     * @throws {Error} If user or logs not found
     */
    async getLogs(id) {
        if (!id) {
            const error = new Error('No ID provided');
            error.code = 400;
            throw error;
        }
        //Get logs
        const logs = await LogModel.find({ userId: id });

        if (!logs) {
            const error = new Error('No logs found for the provided user');
            error.code = 404;
            throw error;
        }
        return logs;
    },

    /**
     * Get cart id for a user
     * @param {ID} id - The user's ID.
     * @returns {ObjectId} The user's cart id
     * @throws {Error} If user not found or ID not provided
     */
    async getCartId(id) {
        if (!id) {
            const error = new Error('No ID provided');
            error.code = 400;
            throw error;
        }

        const user = await UserModel.findById(id);
        if (!user) {
            const error = new Error('User not found');
            error.code = 404;
            throw error;
        }

        return user.cart;
    },

    async setCartId(userId, cartId) {
        if (!userId) {
            const error = new Error('No user ID provided');
            error.code = 400;
            throw error;
        }
        const user = await UserModel.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.code = 404;
            throw error;
        }
        user.cart = cartId;
        await user.save();
        return user.cart;
    },

    /**
     * Create a new feedback
     * @param {ID} userId - The user's ID.
     * @param {String} feedback - The feedback text.
     * @param {Number} rating - The rating (1-5).
     * @returns {Object} The created feedback
     * @throws {Error} If parameters are missing
     */
    async createFeedback(userId, feedback, rating) {
        if (!userId || !feedback || !rating) {
            const error = new Error('Missing required fields');
            error.code = 400;
            throw error;
        }

        const newFeedback = new FeedbackModel({
            userId,
            feedback,
            rating
        });

        await newFeedback.save();

        return newFeedback;
    },

    /**
     * Get feedback by user ID
     * @param {ID} userId - The user's ID.
     * @returns {Array} List of feedback from the user
     * @throws {Error} If user ID is missing
     */
    async getFeedback(userId) {
        if (!userId) {
            const error = new Error('No user ID provided');
            error.code = 400;
            throw error;
        }

        const feedbackList = await FeedbackModel.find({ userId });

        if (!feedbackList || feedbackList.length === 0) {
            const error = new Error('No feedback found for this user');
            error.code = 404;
            throw error;
        }

        return feedbackList;
    },

    /**
     * Get all feedback
     * @returns {Array} List of all feedback
     */
    async getAllFeedback({ page = 1, limit = 10 } = {}) {
        const skip = (page - 1) * limit;
        const [feedback, total] = await Promise.all([
            FeedbackModel.find()
                .populate('userId', 'name email')
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 }),
            FeedbackModel.countDocuments()
        ]);
        return {
            feedback,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        };
    },

    /**
     * Delete feedback by ID
     * @param {ID} feedbackId - The feedback ID.
     * @returns {Object} The deleted feedback
     * @throws {Error} If feedback not found
     */
    async deleteFeedback(feedbackId) {
        if (!feedbackId) {
            const error = new Error('No feedback ID provided');
            error.code = 400;
            throw error;
        }

        const deletedFeedback = await FeedbackModel.findByIdAndDelete(feedbackId);

        if (!deletedFeedback) {
            const error = new Error('Feedback not found');
            error.code = 404;
            throw error;
        }

        return deletedFeedback;
    },

    /**
     * Get all users with pagination and search
     * @param {Object} query - Query parameters (page, limit, search)
     * @returns {Object} Paginated users
     */
    async getAllUsers({ page = 1, limit = 10, search = '' }) {
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            UserModel.find(query)
                .select('-password') // Exclude password
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 }),
            UserModel.countDocuments(query)
        ]);

        return {
            users,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        };
    },

    /**
     * Admin update user (includes role)
     */
    async adminUpdateUser(id, { name, email, role }) {
        const user = await UserModel.findById(id);
        if (!user) {
            const error = new Error('User not found');
            error.code = 404;
            throw error;
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;

        await user.save();

        const log = new LogModel({
            action: 'UPDATE',
            description: `Admin updated user ${id}`,
            severity: 'NOTICE',
            type: 'SUCCESS',
            userId: user._id,
        });
        await log.save();

        return user;
    },

    /**
     * Get dashboard stats (Orders and Reservations per day)
     */
    async getDashboardStats() {
        // Aggregate Orders by day
        const orderStats = await OrderModel.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    orders: { $sum: 1 }
                }
            }
        ]);

        // Aggregate Reservations by day
        const reservationStats = await ReservationModel.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$reservationDate" } },
                    reservations: { $sum: 1 }
                }
            }
        ]);

        // Merge results
        const statsMap = {};

        orderStats.forEach(stat => {
            const date = stat._id;
            if (!statsMap[date]) statsMap[date] = { date, orders: 0, reservations: 0 };
            statsMap[date].orders = stat.orders;
        });

        reservationStats.forEach(stat => {
            const date = stat._id;
            if (!statsMap[date]) statsMap[date] = { date, orders: 0, reservations: 0 };
            statsMap[date].reservations = stat.reservations;
        });

        // Convert to array and sort by date
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const result = Object.values(statsMap)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
        // Optional: Filter for last 30 days or similar if needed, but for now return all
        // .filter(item => new Date(item.date) >= sevenDaysAgo);

        return result;
    }


};

module.exports = customerService;