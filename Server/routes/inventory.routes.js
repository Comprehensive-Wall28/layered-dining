const router = require('express').Router();
const inventoryController = require('../controllers/inventroy.controller');
const authenticationMiddleware = require('../middleware/authentication.middleware');

// Get all items (any logged-in user can view)
router.get('/', authenticationMiddleware, inventoryController.getAllItems);

// Get a single item by ID
router.get('/:id', authenticationMiddleware, inventoryController.getItemById);

// Create a new item (Manager only)
router.post('/', authenticationMiddleware, inventoryController.createItem);

// Update an item (Manager only)
router.put('/:id', authenticationMiddleware, inventoryController.updateItem);

// Delete an item (Manager only)
router.delete('/:id', authenticationMiddleware, inventoryController.deleteItem);

// Check item expiration status
router.get('/:id/expiration', authenticationMiddleware, inventoryController.checkExpiration);

// Get low stock items (Manager only)
router.get('/report/low-stock', authenticationMiddleware, inventoryController.getLowStockItems);

// Update item quantity (Manager only)
router.put('/:id/quantity', authenticationMiddleware, inventoryController.updateQuantity);

module.exports = router;
