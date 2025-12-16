require("dotenv").config();
const authService = require("../services/auth.service");
const cartService = require("../services/cart.service");
const authController = {

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const token = await authService.login(email, password);

            res.cookie('jwt', token, {
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            res.status(200).json({ 
                status: 'success', 
                message: 'Logged in successfully'
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }  
    },
    
    register: async (req, res) => {
        // 1. Extract from the request
        const { email, password, name, role } = req.body;


        try {
            // 2. Create user first, then create a cart and attach it to avoid orphan carts
            const newUser = await authService.registerUser(email, password, name, role);
            // create a cart associated with this user
            const userCart = await cartService.createCart(newUser.id);
            // attach cart to user
            const userService = require('../services/user.service');
            await userService.setCartId(newUser.id, userCart._id);
            const cartId = await userService.getCartId(newUser.id);

            res.status(201).json({ 
                message: 'User registered successfully',
                user: { ...newUser, cart: cartId }
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({ 
                error: true, 
                message: error.message 
            });
        }
    },

    logout: async (req, res) => {
        // Clear the 'jwt' token cookie. 
        res.clearCookie('jwt', {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict' 
        });
        res.status(200).json({ message: 'Logged out successfully' });
    }
}
module.exports = authController;
