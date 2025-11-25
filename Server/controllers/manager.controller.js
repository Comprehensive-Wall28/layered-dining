require("dotenv").config();
const managerService = require("../services/manager.service");

const managerController = {


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


    getCurrentOrder: async (req, res) =>
    {
       //awaiting order to be finished for implementation
    },

    deleteCurrentOrder: async (req, res) =>
    {
       //awaiting order to be finished for implementation
    },

    acceptOrder: async (req, res)=>
    {
       //awaiting order to be finished for implementation
    },

    updateOrderStatus: async(req, res)=>
    {
       //awaiting order to be finished for implementation
    }

}

module.exports = managerController;