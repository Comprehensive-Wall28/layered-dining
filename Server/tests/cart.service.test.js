const cartService = require('../services/cart.service');
const Cart = require('../models/cart.js');
const MenuItem = require('../models/menu');

jest.mock('../models/cart.js');
jest.mock('../models/menu');

describe('CartService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createCart', () => {
        it('should create an empty cart without customerId', async () => {
            const mockSave = jest.fn().mockResolvedValue({ _id: 'cart123', items: [] });
            Cart.mockImplementation(() => ({
                save: mockSave
            }));

            const result = await cartService.createCart();

            expect(Cart).toHaveBeenCalledWith({});
            expect(mockSave).toHaveBeenCalled();
            expect(result).toEqual({ _id: 'cart123', items: [] });
        });

        it('should create a cart with customerId', async () => {
            const mockSave = jest.fn().mockResolvedValue({ _id: 'cart123', customerId: 'user123', items: [] });
            Cart.mockImplementation(() => ({
                save: mockSave
            }));

            const result = await cartService.createCart('user123');

            expect(Cart).toHaveBeenCalledWith({ customerId: 'user123' });
            expect(mockSave).toHaveBeenCalled();
            expect(result.customerId).toBe('user123');
        });
    });

    describe('getCart', () => {
        it('should return a cart by ID', async () => {
            const mockCart = { _id: 'cart123', items: [] };
            Cart.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockCart)
            });

            const result = await cartService.getCart('cart123');

            expect(Cart.findById).toHaveBeenCalledWith('cart123');
            expect(result).toEqual(mockCart);
        });
    });

    describe('getCartByUserId', () => {
        it('should return a cart by user ID', async () => {
            const mockCart = { _id: 'cart123', customerId: 'user123', items: [] };
            Cart.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockCart)
            });

            const result = await cartService.getCartByUserId('user123');

            expect(Cart.findOne).toHaveBeenCalledWith({ customerId: 'user123' });
            expect(result).toEqual(mockCart);
        });
    });

    describe('calculateTotalPrice', () => {
        it('should return 0 for empty cart', async () => {
            const cart = { items: [] };
            const total = await cartService.calculateTotalPrice(cart);
            expect(total).toBe(0);
        });

        it('should calculate total for populated items', async () => {
            const cart = {
                items: [
                    { menuItemId: { _id: 'menu1', price: 10 }, quantity: 2 },
                    { menuItemId: { _id: 'menu2', price: 15 }, quantity: 1 }
                ]
            };

            MenuItem.find.mockResolvedValue([
                { _id: 'menu1', price: 10 },
                { _id: 'menu2', price: 15 }
            ]);

            const total = await cartService.calculateTotalPrice(cart);
            expect(total).toBe(35);
        });

        it('should calculate total for unpopulated items', async () => {
            const cart = {
                items: [
                    { menuItemId: 'menu1', quantity: 2 },
                    { menuItemId: 'menu2', quantity: 1 }
                ]
            };

            MenuItem.find.mockResolvedValue([
                { _id: 'menu1', price: 10 },
                { _id: 'menu2', price: 15 }
            ]);

            const total = await cartService.calculateTotalPrice(cart);
            expect(total).toBe(35);
        });
    });

    describe('addItem', () => {
        it('should add a new item to the cart', async () => {
            const mockCart = {
                _id: 'cart123',
                items: [],
                save: jest.fn().mockResolvedValue(true)
            };

            Cart.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockCart)
            });
            MenuItem.findById.mockResolvedValue({ _id: 'menu1', price: 10 });

            // Mock getCart call inside addItem to return the cart again
            Cart.findById.mockReturnValueOnce({
                populate: jest.fn().mockResolvedValue(mockCart)
            })
                // Mock getCart call at end of addItem
                .mockReturnValueOnce({
                    populate: jest.fn().mockResolvedValue(mockCart)
                });

            // Logic in calculateTotalPrice will need MenuItem.find
            MenuItem.find.mockResolvedValue([{ _id: 'menu1', price: 10 }]);

            const item = { menuItemId: 'menu1', quantity: 2 };
            await cartService.addItem('cart123', item);

            expect(mockCart.items).toHaveLength(1);
            expect(mockCart.items[0]).toEqual({ menuItemId: 'menu1', quantity: 2 });
            expect(mockCart.save).toHaveBeenCalled();
        });

        it('should update quantity if item already exists', async () => {
            const mockCart = {
                _id: 'cart123',
                items: [{ menuItemId: { _id: 'menu1' }, quantity: 1 }],
                save: jest.fn().mockResolvedValue(true)
            };

            Cart.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockCart)
            });
            MenuItem.findById.mockResolvedValue({ _id: 'menu1', price: 10 });
            MenuItem.find.mockResolvedValue([{ _id: 'menu1', price: 10 }]);


            const item = { menuItemId: 'menu1', quantity: 2 };
            await cartService.addItem('cart123', item);

            expect(mockCart.items[0].quantity).toBe(3);
            expect(mockCart.save).toHaveBeenCalled();
        });

        it('should throw error if cart not found', async () => {
            Cart.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
            await expect(cartService.addItem('cart123', {})).rejects.toThrow('Cart not found');
        });

        it('should throw error if menu item not found', async () => {
            const mockCart = { _id: 'cart123', items: [] };
            Cart.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockCart) });
            MenuItem.findById.mockResolvedValue(null);

            await expect(cartService.addItem('cart123', { menuItemId: 'invalid' })).rejects.toThrow('Menu item not found');
        });
    });

    describe('removeItem', () => {
        it('should remove an item from the cart', async () => {
            const mockCart = {
                _id: 'cart123',
                items: [{ menuItemId: { _id: 'menu1' } }, { menuItemId: { _id: 'menu2' } }],
                save: jest.fn().mockResolvedValue(true)
            };

            Cart.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockCart) });
            MenuItem.find.mockResolvedValue([]);

            await cartService.removeItem('cart123', 'menu1');

            expect(mockCart.items).toHaveLength(1);
            expect(mockCart.items[0].menuItemId._id).toBe('menu2');
            expect(mockCart.save).toHaveBeenCalled();
        });
    });

    describe('updateItemQuantity', () => {
        it('should update item quantity', async () => {
            const mockCart = {
                _id: 'cart123',
                items: [{ menuItemId: { _id: 'menu1' }, quantity: 1 }],
                save: jest.fn().mockResolvedValue(true)
            };

            Cart.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockCart) });
            MenuItem.find.mockResolvedValue([{ _id: 'menu1', price: 10 }]);

            await cartService.updateItemQuantity('cart123', 'menu1', 5);

            expect(mockCart.items[0].quantity).toBe(5);
            expect(mockCart.save).toHaveBeenCalled();
        });

        it('should remove item if quantity is <= 0', async () => {
            const mockCart = {
                _id: 'cart123',
                items: [{ menuItemId: { _id: 'menu1' }, quantity: 1 }],
                save: jest.fn().mockResolvedValue(true)
            };

            Cart.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockCart) });
            MenuItem.find.mockResolvedValue([]);

            await cartService.updateItemQuantity('cart123', 'menu1', 0);

            expect(mockCart.items).toHaveLength(0);
            expect(mockCart.save).toHaveBeenCalled();
        });

        it('should throw error if item not found in cart', async () => {
            const mockCart = {
                _id: 'cart123',
                items: []
            };

            Cart.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockCart) });

            await expect(cartService.updateItemQuantity('cart123', 'menu1', 5)).rejects.toThrow('Item not found');
        });
    });

    describe('emptyCart', () => {
        it('should remove all items from the cart', async () => {
            const mockCart = {
                _id: 'cart123',
                items: [{ menuItemId: 'menu1' }],
                save: jest.fn().mockResolvedValue(true)
            };

            Cart.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockCart) });

            await cartService.emptyCart('cart123');

            expect(mockCart.items).toHaveLength(0);
            expect(mockCart.totalPrice).toBe(0);
            expect(mockCart.save).toHaveBeenCalled();
        });
    });
});
