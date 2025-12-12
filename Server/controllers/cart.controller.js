const cartService = require('../services/cart.service');
const userService = require('../services/user.service');

class CartController {

    async createCart(req, res) {
        try {
            // if authenticated, attach cart to user
            let customerId = req.user && req.user.id ? req.user.id : null;
            const cart = await cartService.createCart(customerId);
            // if created for an authenticated user, also persist cart id on user
            if (customerId) {
                await userService.setCartId(customerId, cart._id);
            }
            res.status(201).json(cart);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getCart(req, res) {
        try {
            let cartId = req.params.cartId;
            if (!cartId && req.user && req.user.id) {
                cartId = await userService.getCartId(req.user.id);
            }
            if (!cartId) return res.status(400).json({ error: 'cartId is required' });
            const cart = await cartService.getCart(cartId);
            if (!cart) return res.status(404).json({ error: 'Cart not found' });
            res.json(cart);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async addItem(req, res) {
        try {
            let cartId = req.params.cartId;
            if (!cartId && req.user && req.user.id) {
                cartId = await userService.getCartId(req.user.id);
            }

            // Auto-create cart if it doesn't exist for authenticated user
            if (!cartId && req.user && req.user.id) {
                const newCart = await cartService.createCart(req.user.id);
                cartId = newCart._id;
                await userService.setCartId(req.user.id, cartId);
            }

            if (!cartId) return res.status(400).json({ error: 'cartId is required' });

            const item = req.body;
            const cart = await cartService.addItem(cartId, item);
            res.json(cart);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async removeItem(req, res) {
        try {
            let cartId = req.params.cartId;
            if (!cartId && req.user && req.user.id) {
                cartId = await userService.getCartId(req.user.id);
            }
            if (!cartId) return res.status(400).json({ error: 'cartId is required' });
            const { menuItemId } = req.body;
            const cart = await cartService.removeItem(cartId, menuItemId);
            res.json(cart);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async updateItemQuantity(req, res) {
        try {
            let cartId = req.params.cartId;
            if (!cartId && req.user && req.user.id) {
                cartId = await userService.getCartId(req.user.id);
            }
            if (!cartId) return res.status(400).json({ error: 'cartId is required' });
            const { menuItemId, quantity } = req.body;
            const cart = await cartService.updateItemQuantity(cartId, menuItemId, quantity);
            res.json(cart);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async emptyCart(req, res) {
        try {
            let cartId = req.params.cartId;
            if (!cartId && req.user && req.user.id) {
                cartId = await userService.getCartId(req.user.id);
            }
            if (!cartId) return res.status(400).json({ error: 'cartId is required' });
            const cart = await cartService.emptyCart(cartId);
            res.json(cart);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new CartController();

