const orderService = require('../services/order.service');
const cartService = require('../services/cart.service');
const userService = require('../services/user.service');
/**
 * Create a new order
 * POST /api/orders
 */
async function createOrder(req, res) {
    try {
        const { items: itemsFromBody, orderType, paymentStatus, customerNotes } = req.body;
        const customerId = req.user.id;

        // get customer name from user service
        const currentUser = await userService.getCurrentUser(customerId);
        const customerName = currentUser.name;

        // if items aren't provided in the request, use the user's cart
        let items = itemsFromBody;
        let cartId;
        if (!items || items.length === 0) {
            cartId = await userService.getCartId(customerId);
            if (!cartId) {
                const error = new Error('No cart found for user');
                error.code = 400;
                throw error;
            }
            const cart = await cartService.getCart(cartId);
            if (!cart || !cart.items || cart.items.length === 0) {
                const error = new Error('Cart is empty');
                error.code = 400;
                throw error;
            }
            items = cart.items;
        }

        const order = await orderService.createOrder({
            customerId,
            customerName,
            items,
            orderType,
            paymentStatus,
            customerNotes
        });

        // empty the cart if we used it
        try {
            if (!cartId) cartId = await userService.getCartId(customerId);
            if (cartId) await cartService.emptyCart(cartId);
        } catch (err) {
            console.error('Failed to empty cart after order:', err.message || err);
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        const statusCode = error.code || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
}



/**
 * Get order by ID
 * GET /api/orders/:id
 */
async function getOrderById(req, res) {
    try {
        const { id } = req.params;
        const order = await orderService.getOrderById(id);

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        const statusCode = error.code || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * Get orders by customer ID
 * GET /api/orders/customer/:customerId
 */
async function getOrdersByCustomerId(req, res) {
    try {
        const { customerId } = req.params;
        const orders = await orderService.getOrdersByCustomerId(customerId);

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        const statusCode = error.code || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * Get all orders
 * GET /api/orders
 */
async function getAllOrders(req, res) {
    try {
        const orders = await orderService.getAllOrders();

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        const statusCode = error.code || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * Update order status
 * PUT /api/orders/:id/status
 */
async function updateOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, paymentStatus } = req.body;

        if (!status && !paymentStatus) {
            return res.status(400).json({
                success: false,
                message: 'Status or PaymentStatus is required'
            });
        }

        const order = await orderService.updateOrderStatus(id, status, paymentStatus);

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        const statusCode = error.code || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    createOrder,
    getOrderById,
    getOrdersByCustomerId,
    getAllOrders,
    updateOrderStatus
};
