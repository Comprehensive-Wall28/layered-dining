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
        // Calculate total price from current menu item prices
        const menuIds = items.map(i => i.menuItemId._id || i.menuItemId);
        const menuDocs = await MenuItem.find({ _id: { $in: menuIds } });
        const priceMap = {};
        for (const m of menuDocs) priceMap[m._id.toString()] = m.price || 0;

        const orderItems = [];
        let totalPrice = 0;
        for (const it of items) {
            const rawId = it.menuItemId._id || it.menuItemId;
            const id = rawId.toString ? rawId.toString() : String(rawId);
            const qty = Number(it.quantity) || 1;
            const price = priceMap[id] ?? 0;
            totalPrice += price * qty;

            orderItems.push({
                menuItemId: id,
                quantity: qty,
                price: price
            });
        }

        const order = new Order({
            customerId,
            customerName,
            items: orderItems,
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
        const order = await Order.findById(id).populate('items.menuItemId');
        if (!order) {
            const error = new Error('Order not found');
            error.code = 404;
            throw error;
        }
        return order;
    },

    async getOrderStatus(id) {
        const order = await Order.findById(id).select('status');
        if (!order) {
            const error = new Error('Order not found');
            error.code = 404;
            throw error;
        }
        return { status: order.status };
    },

    async getOrdersByCustomerId(customerId) {
        return await Order.find({ customerId }).populate('items.menuItemId');
    },

    async getAllOrders() {
        return await Order.find({}).populate('items.menuItemId');
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
    },

    async payForOrder(id) {
        const order = await Order.findById(id);
        if (!order) {
            const error = new Error('Order not found');
            error.code = 404;
            throw error;
        }
        if (order.paymentStatus === 'Paid') {
            const error = new Error('Order is already paid');
            error.code = 400;
            throw error;
        }
        order.paymentStatus = 'Paid';
        if (order.status === 'Pending') {
            order.status = 'In Progress';
        }
        order.updatedAt = Date.now();
        await order.save();
        return order;
    },

    async refundOrder(id) {
        const order = await Order.findById(id);
        if (!order) {
            const error = new Error('Order not found');
            error.code = 404;
            throw error;
        }
        if (order.paymentStatus !== 'Paid') {
            const error = new Error('Only paid orders can be refunded');
            error.code = 400;
            throw error;
        }
        order.paymentStatus = 'Refunded';
        order.updatedAt = Date.now();
        await order.save();
        return order;
    }
};

module.exports = orderService;