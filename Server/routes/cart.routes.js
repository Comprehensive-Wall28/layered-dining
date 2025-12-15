const router = require('express').Router();
const cartController = require('../controllers/cart.controller');
const authenticationMiddleware = require('../middleware/authentication.middleware');

// Create a new cart
router.post('/', authenticationMiddleware, cartController.createCart);

// Convenience routes for authenticated users (operate on current user's cart)
router.get('/', authenticationMiddleware, cartController.getCart);
router.post('/items', authenticationMiddleware, cartController.addItem);
router.delete('/items', authenticationMiddleware, cartController.removeItem);
router.patch('/items', authenticationMiddleware, cartController.updateItemQuantity);
router.post('/empty', authenticationMiddleware, cartController.emptyCart);

// Get cart
router.get('/:cartId', cartController.getCart);

// Add item
router.post('/:cartId/items', cartController.addItem);

// Remove item
router.delete('/:cartId/items', cartController.removeItem);

// Update quantity
router.patch('/:cartId/items', cartController.updateItemQuantity);

// Empty cart
router.post('/:cartId/empty', cartController.emptyCart);

module.exports = router;
