const orderService = require('../services/order.service');
const Order = require('../models/order');
const MenuItem = require('../models/menu');
const LogModel = require('../models/log');

jest.mock('../models/order');
jest.mock('../models/menu');
jest.mock('../models/log');

describe('OrderService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createOrder', () => {
        const mockItems = [
            { menuItemId: 'menu1', quantity: 2 },
            { menuItemId: 'menu2', quantity: 1 }
        ];
        const mockOrderData = {
            customerId: 'user123',
            customerName: 'Test User',
            items: mockItems,
            orderType: 'Dine-In'
        };

        it('should create order successfully', async () => {
            const mockMenuDocs = [
                { _id: 'menu1', price: 10 },
                { _id: 'menu2', price: 15 }
            ];
            MenuItem.find.mockResolvedValue(mockMenuDocs);

            const mockSavedOrder = {
                ...mockOrderData,
                _id: 'order123',
                totalPrice: 35,
                save: jest.fn().mockResolvedValue(true)
            };
            Order.mockImplementation(() => mockSavedOrder);
            LogModel.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(true)
            }));

            const result = await orderService.createOrder(mockOrderData);

            expect(MenuItem.find).toHaveBeenCalled();
            expect(mockSavedOrder.save).toHaveBeenCalled();
            expect(LogModel).toHaveBeenCalled();
            expect(result.totalPrice).toBe(35);
        });

        it('should throw error if customerId missing', async () => {
            await expect(orderService.createOrder({ ...mockOrderData, customerId: null }))
                .rejects.toThrow('Customer ID is required');
        });

        it('should throw error if no items', async () => {
            await expect(orderService.createOrder({ ...mockOrderData, items: [] }))
                .rejects.toThrow('Order must contain at least one item');
        });
    });

    describe('getOrderById', () => {
        it('should return order if found', async () => {
            const mockOrder = { _id: 'order123' };
            Order.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockOrder)
            });

            const result = await orderService.getOrderById('order123');
            expect(result).toEqual(mockOrder);
        });

        it('should throw error if not found', async () => {
            Order.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });
            await expect(orderService.getOrderById('order123')).rejects.toThrow('Order not found');
        });
    });

    describe('getOrderStatus', () => {
        it('should return status', async () => {
            const mockOrder = { status: 'Pending' };
            Order.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockOrder)
            });

            const result = await orderService.getOrderStatus('order123');
            expect(result).toEqual({ status: 'Pending' });
        });

        it('should throw error if not found', async () => {
            Order.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });
            await expect(orderService.getOrderStatus('order123')).rejects.toThrow('Order not found');
        });
    });

    describe('getOrdersByCustomerId', () => {
        it('should return orders for customer', async () => {
            const mockOrders = [{ _id: 'o1' }];
            Order.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockOrders)
            });

            const result = await orderService.getOrdersByCustomerId('u1');
            expect(result).toEqual(mockOrders);
        });
    });

    describe('getAllOrders', () => {
        it('should return all orders', async () => {
            const mockOrders = [{ _id: 'o1' }];
            Order.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockOrders)
            });

            const result = await orderService.getAllOrders();
            expect(result).toEqual(mockOrders);
        });
    });

    describe('updateOrderStatus', () => {
        it('should update status and payment', async () => {
            const mockOrder = {
                _id: 'o1',
                status: 'Pending',
                paymentStatus: 'Unpaid',
                save: jest.fn().mockResolvedValue(true)
            };
            Order.findById.mockResolvedValue(mockOrder);

            await orderService.updateOrderStatus('o1', 'Completed', 'Paid');

            expect(mockOrder.status).toBe('Completed');
            expect(mockOrder.paymentStatus).toBe('Paid');
            expect(mockOrder.save).toHaveBeenCalled();
        });

        it('should throw error if order not found', async () => {
            Order.findById.mockResolvedValue(null);
            await expect(orderService.updateOrderStatus('o1', 'Completed')).rejects.toThrow('Order not found');
        });
    });

    describe('payForOrder', () => {
        it('should mark order as paid', async () => {
            const mockOrder = {
                _id: 'o1',
                status: 'Pending',
                paymentStatus: 'Unpaid',
                save: jest.fn().mockResolvedValue(true)
            };
            Order.findById.mockResolvedValue(mockOrder);

            await orderService.payForOrder('o1');

            expect(mockOrder.paymentStatus).toBe('Paid');
            expect(mockOrder.status).toBe('In Progress');
            expect(mockOrder.save).toHaveBeenCalled();
        });

        it('should throw if already paid', async () => {
            const mockOrder = {
                _id: 'o1',
                paymentStatus: 'Paid'
            };
            Order.findById.mockResolvedValue(mockOrder);

            await expect(orderService.payForOrder('o1')).rejects.toThrow('Order is already paid');
        });

        it('should throw if order not found', async () => {
            Order.findById.mockResolvedValue(null);
            await expect(orderService.payForOrder('o1')).rejects.toThrow('Order not found');
        });
    });

    describe('refundOrder', () => {
        it('should refund paid order', async () => {
            const mockOrder = {
                _id: 'o1',
                paymentStatus: 'Paid',
                save: jest.fn().mockResolvedValue(true)
            };
            Order.findById.mockResolvedValue(mockOrder);

            await orderService.refundOrder('o1');

            expect(mockOrder.paymentStatus).toBe('Refunded');
            expect(mockOrder.save).toHaveBeenCalled();
        });

        it('should throw if not paid', async () => {
            const mockOrder = {
                _id: 'o1',
                paymentStatus: 'Unpaid'
            };
            Order.findById.mockResolvedValue(mockOrder);

            await expect(orderService.refundOrder('o1')).rejects.toThrow('Only paid orders can be refunded');
        });

        it('should throw if order not found', async () => {
            Order.findById.mockResolvedValue(null);
            await expect(orderService.refundOrder('o1')).rejects.toThrow('Order not found');
        });
    });
});
