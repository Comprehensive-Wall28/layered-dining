const { acceptOrder } = require('../controllers/manager.controller');
const Order = require('../models/order');
const UserModel = require('../models/user');
const { updateOrderStatus } = require('./order.service');


const managerService = {

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

    async acceptOrder({orderID}){

        if (!orderID) {
            const error = new Error('Order ID is required');
            error.code = 400;
            throw error;
        }
        else{
        
        }

    },

    async updateOrderStatus(){

    }
};

module.exports = managerService;
