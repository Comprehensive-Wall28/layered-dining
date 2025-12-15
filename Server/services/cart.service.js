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
        return await Cart.findById(cartId).populate('items.menuItemId');
    }

    async getCartByUserId(userId) {
        return await Cart.findOne({ customerId: userId }).populate('items.menuItemId');
    }

    // compute total using current MenuItem prices
    async calculateTotalPrice(cart) {
        if (!cart || !cart.items || cart.items.length === 0) return 0;
        // If items are populated, we can use them directly, else we need to fetch.
        // But logic below handles unpopulated IDs. If populated, access _id.

        let menuIds = [];
        if (cart.items.length > 0 && cart.items[0].menuItemId._id) {
            menuIds = cart.items.map(i => i.menuItemId._id);
        } else {
            menuIds = cart.items.map(i => i.menuItemId);
        }

        const menuDocs = await MenuItem.find({ _id: { $in: menuIds } });
        const priceMap = {};
        for (const m of menuDocs) priceMap[m._id.toString()] = m.price || 0;

        return cart.items.reduce((sum, i) => {
            const id = (i.menuItemId._id || i.menuItemId).toString();
            const price = priceMap[id] ?? 0;
            return sum + price * (i.quantity || 0);
        }, 0);
    }

    async addItem(cartId, item) {
        const cart = await this.getCart(cartId); // Already populates, but we need raw IDs for some checks? mixed usage. 
        // Actually, if we populate, existingItem search needs to handle object.
        if (!cart) throw new Error('Cart not found');

        if (!item || !item.menuItemId) throw new Error('menuItemId is required');

        // validate that the menu item exists
        const menuDoc = await MenuItem.findById(item.menuItemId);
        if (!menuDoc) throw new Error('Menu item not found');

        const existingItem = cart.items.find(i => (i.menuItemId._id || i.menuItemId).toString() === item.menuItemId.toString());

        if (existingItem) {
            existingItem.quantity += item.quantity || 1;
        } else {
            cart.items.push({ menuItemId: item.menuItemId, quantity: item.quantity || 1 });
        }

        cart.totalPrice = await this.calculateTotalPrice(cart);

        await cart.save();
        return await this.getCart(cartId); // Return fully populated cart
    }

    async removeItem(cartId, menuItemId) {
        const cart = await this.getCart(cartId);
        if (!cart) throw new Error('Cart not found');

        cart.items = cart.items.filter(i => (i.menuItemId._id || i.menuItemId).toString() !== menuItemId.toString());

        cart.totalPrice = await this.calculateTotalPrice(cart);

        await cart.save();
        return await this.getCart(cartId);
    }

    async updateItemQuantity(cartId, menuItemId, quantity) {
        const cart = await this.getCart(cartId);
        if (!cart) throw new Error('Cart not found');

        const item = cart.items.find(i => (i.menuItemId._id || i.menuItemId).toString() === menuItemId.toString());
        if (!item) throw new Error('Item not found');

        item.quantity = quantity;

        if (item.quantity <= 0) {
            cart.items = cart.items.filter(i => (i.menuItemId._id || i.menuItemId).toString() !== menuItemId.toString());
        }

        cart.totalPrice = await this.calculateTotalPrice(cart);

        await cart.save();
        return await this.getCart(cartId);
    }

    async emptyCart(cartId) {
        const cart = await this.getCart(cartId);
        if (!cart) throw new Error('Cart not found');

        cart.items = [];
        cart.totalPrice = 0;

        await cart.save();
        return await this.getCart(cartId);
    }
}

module.exports = new CartService();
