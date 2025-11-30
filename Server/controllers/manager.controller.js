require("dotenv").config();
const order = require("../models/order");
const managerService = require("../services/manager.service");
const orderService = require("../services/order.service");

const managerController = {



    acceptOrder: async (req, res)=>
    {
        try {
            const {id} = req.order;
            //call service
            const order = await managerService.acceptOrder(id);

            res.status(200).json({
                status: 'success',
                order
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

    updateOrderStatus: async(req, res)=>
    {
        try {
            const {id} = order.user;
            //call service
            const order = await managerService.updateOrderStatus(id);

            res.status(200).json({
                status: 'success',
                order
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
    }

}

module.exports = managerController;