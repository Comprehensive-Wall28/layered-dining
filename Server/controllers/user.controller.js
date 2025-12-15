require("dotenv").config();
const userService = require("../services/user.service");

const userController = {

    deleteAccount: async (req, res) => { //can manager also do it?
        try {
            const { id } = req.params;

            if (!id) {
                const error = new Error('No ID provided')
                error.code = 400;
                throw error;
            }

            await userService.deleteAccount(id);

            res.status(200).json({
                status: 'success',
                message: 'User account deleted successfully'
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    },

    getCurrentUser: async (req, res) => { //can manager also do it?
        try {
            const { id } = req.user;
            //call service
            const user = await userService.getCurrentUser(id);

            res.status(200).json({
                status: 'success',
                user
            });

        } catch (error) {
            if (error.code == 404) { //user not found
                res.status(404).json({
                    status: 'error',
                    message: error.message
                });
            } else if (error.code == 400) { //ID not provided
                res.status(400).json({
                    status: 'error',
                    message: error.message
                });
            } else {
                res.status(500).json({ //Server error
                    status: 'error',
                    message: error.message
                });
            }
        }
    },

    getCartId: async (req, res) => {
        try {
            const { id } = req.user;
            const cartId = await userService.getCartId(id);

            res.status(200).json({
                status: 'success',
                cartId
            });
        } catch (error) {
            res.status(error.code || 500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    updateUserProfile: async (req, res) => { //can manager also do it?
        try {
            const { id } = req.user;
            const { name, email, password } = req.body;

            //call service
            const user = await userService.updateUserProfile(id, name, email, password);

            res.status(200).json({
                status: 'success',
                user
            });

        } catch (error) {
            if (error.code == 404) { //user not found
                res.status(404).json({
                    status: 'error',
                    message: error.message
                });
            } else {
                res.status(500).json({
                    status: 'error',
                    message: error.message
                });
            }
        }
    },

    getLogs: async (req, res) => { //what does this do?
        try {
            const { id } = req.params;
            //call service
            const logs = await userService.getLogs(id);

            res.status(200).json({
                status: 'success',
                logs
            });

        } catch (error) {
            res.status(error.code || 500).json({
                status: 'error',
                message: error.message
            })
        }
    },

    createFeedback: async (req, res) => {
        try {
            const { feedback, rating } = req.body;
            const { id } = req.user;

            const result = await userService.createFeedback(id, feedback, rating);

            res.status(201).json({
                status: 'success',
                result
            });

        } catch (error) {
            if (error.code == 400) { //feedback not provided
                res.status(400).json({
                    status: 'error',
                    message: error.message
                });
            } else {
                res.status(500).json({
                    status: 'error',
                    message: error.message
                });
            }
        }
    },

    getFeedback: async (req, res) => {
        try {
            const { id } = req.params;

            const result = await userService.getFeedback(id);

            res.status(200).json({
                status: 'success',
                result
            });

        } catch (error) {
            if (error.code == 404) {
                res.status(404).json({
                    status: 'error',
                    message: error.message
                });
            } else if (error.code == 400) {
                res.status(400).json({
                    status: 'error',
                    message: error.message
                });
            } else {
                res.status(500).json({
                    status: 'error',
                    message: error.message
                });
            }
        }
    },

    getAllFeedback: async (req, res) => {
        try {
            const { page, limit } = req.query;
            const result = await userService.getAllFeedback({ page, limit });

            res.status(200).json({
                status: 'success',
                ...result
            });

        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const { page, limit, search } = req.query;
            const result = await userService.getAllUsers({ page, limit, search });

            res.status(200).json({
                status: 'success',
                ...result
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    deleteFeedback: async (req, res) => {
        try {
            const { id } = req.params;

            await userService.deleteFeedback(id);

            res.status(200).json({
                status: 'success',
                message: 'Feedback deleted successfully'
            });

        } catch (error) {
            if (error.code == 404) {
                res.status(404).json({
                    status: 'error',
                    message: error.message
                });
            } else if (error.code == 400) {
                res.status(400).json({
                    status: 'error',
                    message: error.message
                });
            } else {
                res.status(500).json({
                    status: 'error',
                    message: error.message
                });
            }
        }
    },
    adminUpdateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, password, role } = req.body;

            // Use service to update. Note: userService.updateUserProfile currently only supports name, email, password.
            // If we want to support role update, we might need to update the service or use the model directly here/add service method.
            // Let's check userService again. It takes (id, name, email, password). 
            // I should probably update userService first to accept role or create a new service method `adminUpdateUserProfile`.
            // For now, let's assume I'll update userService too.
            // Actually, I'll stick to updating the controller to use a new service method I'll create.
            const result = await userService.adminUpdateUser(id, { name, email, role });

            res.status(200).json({
                status: 'success',
                message: 'User updated successfully',
                user: result
            });
        } catch (error) {
            res.status(error.code || 500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    getDashboardStats: async (req, res) => {
        try {
            const stats = await userService.getDashboardStats();
            res.status(200).json({
                status: 'success',
                stats
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
}
module.exports = userController;
