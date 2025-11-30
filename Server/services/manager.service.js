const { acceptOrder } = require('../controllers/manager.controller');
const order = require('../models/order');
const Order = require('../models/order');
const User = require('../models/user');
const UserModel = require('../models/user');
const { updateOrderStatus, getOrderById } = require('./order.service');
const {acceptOrder} = require('./order.service');
const customerService = require('./user.service');
const {getCurrentUser} = require('./user.service');


const managerService = {

    async getCurrentUser(id) {

        // if (!id) {
        //     const error = new Error('No ID provided');
        //     error.code = 400;
        //     throw error;
        // }
        // const user = await UserModel.findById(id);

        // if (!user) {
        //     const error = new Error('User not found');
        //     error.code = 404;
        //     throw error;
        // }
        // return {
        //     id: user._id,
        //     name: user.name,
        //     email: user.email,
        //     role: user.role
        // }

        customerService.getCurrentUser(id);
    },

    async acceptOrder({orderID}){

        if (!orderID) {

            const error = new Error('Order ID is required');
            error.code = 400;
            throw error;
        }
        else{
            orderID.status = 'Accepted'
        }

    },

    async updateOrderStatus({orderID, newStatus}){

        const order = new Order(getOrderById(orderID));
        
        if(!orderID){
            
            const error = new Error('Order ID is required');
            error.code = 400;
            throw error;

        }

        else{

            order.status = newStatus

        }
        
    }
};

module.exports = managerService;
