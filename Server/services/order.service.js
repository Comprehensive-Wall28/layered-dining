const Order = require('../models/order');
const MenuItem = require('../models/menu');
const LogModel = require('../models/log');

const orderService = {

    async createOrder({ customerId, customerName, items, orderType, paymentStatus, customerNotes }) {
        if (!customerId) {
            const error = new Error('Customer ID is required');
            error.code = 400;
            throw error;
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            const error = new Error('Order must contain at least one item');
            error.code = 400;
            throw error;
        }

        // Calculate total price from current menu item prices
        const menuIds = items.map(i => i.menuItemId);
        const menuDocs = await MenuItem.find({ _id: { $in: menuIds } });
        const priceMap = {};
        for (const m of menuDocs) priceMap[m._id.toString()] = m.price || 0;

        let totalPrice = 0;
        for (const it of items) {
            const id = it.menuItemId.toString ? it.menuItemId.toString() : String(it.menuItemId);
            const qty = Number(it.quantity) || 1;
            const price = priceMap[id] ?? 0;
            totalPrice += price * qty;
        }

        const order = new Order({
            customerId,
            customerName,
            orderType: orderType || 'Dine-In',
            status: 'Pending',
            totalPrice,
            paymentStatus: paymentStatus || 'Unpaid',
            customerNotes: customerNotes || ''
        });

        await order.save();

        const log = new LogModel({
            action: 'CREATE',
            description: `Order ${order._id} created for user ${customerId}`,
            affectedDocument: order._id,
            affectedModel: 'Order',
            severity: 'NOTICE',
            type: 'SUCCESS',
            userId: customerId,
        });
        await log.save();

        return order;
    },

    async getOrderById(id) {
        const order = await Order.findById(id);
        if (!order) {
            const error = new Error('Order not found');
            error.code = 404;
            throw error;
        }
        return order;
    },

    async getOrdersByCustomerId(customerId) {
        return await Order.find({ customerId });
    },

    async getAllOrders() {
        return await Order.find({});
    },

    async updateOrderStatus(id, status, paymentStatus) {
        const order = await Order.findById(id);
        if (!order) {
            const error = new Error('Order not found');
            error.code = 404;
            throw error;
        }
        if (status) {
            order.status = status;
        }
        if (paymentStatus) {
            order.paymentStatus = paymentStatus;
        }
        order.updatedAt = Date.now();
        await order.save();
        return order;
    }
};

module.exports = orderService;