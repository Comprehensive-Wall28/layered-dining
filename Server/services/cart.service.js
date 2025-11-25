const Cart = require('../models/cart.js');
const MenuItem = require('../models/menu');

class CartService {

    // createCart optionally attaches to a user
    async createCart(customerId = null) {
        const cartData = {};
        if (customerId) cartData.customerId = customerId;
        const cart = new Cart(cartData);
        return await cart.save();
    }

    async getCart(cartId) {
        return await Cart.findById(cartId);
    }

    async getCartByUserId(userId) {
        return await Cart.findOne({ customerId: userId });
    }

    // compute total using current MenuItem prices
    async calculateTotalPrice(cart) {
        if (!cart || !cart.items || cart.items.length === 0) return 0;
        const menuIds = cart.items.map(i => i.menuItemId);
        const menuDocs = await MenuItem.find({ _id: { $in: menuIds } });
        const priceMap = {};
        for (const m of menuDocs) priceMap[m._id.toString()] = m.price || 0;

        return cart.items.reduce((sum, i) => {
            const id = i.menuItemId.toString ? i.menuItemId.toString() : String(i.menuItemId);
            const price = priceMap[id] ?? 0;
            return sum + price * (i.quantity || 0);
        }, 0);
    }

    async addItem(cartId, item) {
        const cart = await this.getCart(cartId);
        if (!cart) throw new Error('Cart not found');

        if (!item || !item.menuItemId) throw new Error('menuItemId is required');

        const existingItem = cart.items.find(i => i.menuItemId.toString() === item.menuItemId.toString());

        if (existingItem) {
            existingItem.quantity += item.quantity || 1;
        } else {
            cart.items.push({ menuItemId: item.menuItemId, quantity: item.quantity || 1 });
        }

        cart.totalPrice = await this.calculateTotalPrice(cart);

        return await cart.save();
    }

    async removeItem(cartId, menuItemId) {
        const cart = await this.getCart(cartId);
        if (!cart) throw new Error('Cart not found');

        cart.items = cart.items.filter(i => i.menuItemId.toString() !== menuItemId.toString());

        cart.totalPrice = await this.calculateTotalPrice(cart);

        return await cart.save();
    }

    async updateItemQuantity(cartId, menuItemId, quantity) {
        const cart = await this.getCart(cartId);
        if (!cart) throw new Error('Cart not found');

        const item = cart.items.find(i => i.menuItemId.toString() === menuItemId.toString());
        if (!item) throw new Error('Item not found');

        item.quantity = quantity;

        if (item.quantity <= 0) {
            cart.items = cart.items.filter(i => i.menuItemId.toString() !== menuItemId.toString());
        }

        cart.totalPrice = await this.calculateTotalPrice(cart);

        return await cart.save();
    }

    async emptyCart(cartId) {
        const cart = await this.getCart(cartId);
        if (!cart) throw new Error('Cart not found');

        cart.items = [];
        cart.totalPrice = 0;

        return await cart.save();
    }
}

module.exports = new CartService();
