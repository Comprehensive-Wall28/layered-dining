require("dotenv").config();
const userService = require("../services/user.service");

const userController = {

    deleteAccount: async (req, res) => {
        try {
            const { id } = req.params;

            if(!id){
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

    getCurrentUser: async (req, res) => {
        try {
            const {id} = req.user;
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
            } else if(error.code == 400) { //ID not provided
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

    updateUserProfile: async (req, res) => {
        try {
            const {id} = req.user;
            const {name, email, password} = req.body;

            //call service
            const user = await userService.updateUserProfile(id, name, email, password);

            res.status(200).json({
                status: 'success',
                user
            });

        } catch (error) {
            if(error.code == 404){ //user not found
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

    getLogs: async (req, res) => {
        try {
            const {id} = req.params;
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
    }
}
module.exports = userController;
