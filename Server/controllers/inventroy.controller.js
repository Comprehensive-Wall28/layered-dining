require("dotenv").config();
const itemsService = require("../services/inventory.service");

// Controller object
const itemsController = {

    /**
     * Get all items (any logged-in user can view)
     */
    getAllItems: async (req, res) => {
        try {
            const filters = {
                status: req.query.status,
                name: req.query.name
            };

            const items = await itemsService.getAllItems(filters);
            res.status(200).json({
                status: 'success',
                count: items.length,
                items
            });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    /**
     * Get a single item by ID
     */
    getItemById: async (req, res) => {
        try {
            const item = await itemsService.getItemById(req.params.id);
            res.status(200).json({ status: 'success', item });
        } catch (error) {
            res.status(error.message.includes('not found') ? 404 : 500).json({ 
                status: 'error', 
                message: error.message 
            });
        }
    },

    /**
     * Create a new item (Manager only)
     */
    createItem: async (req, res) => {
        try {
            if (!['manager'].includes(req.user.type)) {
                return res.status(403).json({ status: 'error', message: 'Unauthorized' });
            }

            const item = await itemsService.createItem(req.body);
            res.status(201).json({ status: 'success', item });
        } catch (error) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    },

    /**
     * Update an item (Manager only)
     */
    updateItem: async (req, res) => {
        try {
            if (!['manager'].includes(req.user.type)) {
                return res.status(403).json({ status: 'error', message: 'Unauthorized' });
            }

            const item = await itemsService.updateItem(req.params.id, req.body);
            res.status(200).json({ status: 'success', item });
        } catch (error) {
            res.status(error.message.includes('not found') ? 404 : 400).json({ 
                status: 'error', 
                message: error.message 
            });
        }
    },

    /**
     * Delete an item (Manager only)
     */
    deleteItem: async (req, res) => {
        try {
            if (!['manager'].includes(req.user.type)) {
                return res.status(403).json({ status: 'error', message: 'Unauthorized' });
            }

            await itemsService.deleteItem(req.params.id);
            res.status(200).json({ status: 'success', message: 'Item deleted successfully' });
        } catch (error) {
            res.status(error.message.includes('not found') ? 404 : 500).json({ 
                status: 'error', 
                message: error.message 
            });
        }
    },

    /**
     * Check item expiration status
     */
    checkExpiration: async (req, res) => {
        try {
            const expirationInfo = await itemsService.checkExpirationStatus(req.params.id);
            res.status(200).json({ status: 'success', expirationInfo });
        } catch (error) {
            res.status(error.message.includes('not found') ? 404 : 500).json({ 
                status: 'error', 
                message: error.message 
            });
        }
    },

    /**
     * Get low stock items
     */
    getLowStockItems: async (req, res) => {
        try {
            if (!['manager'].includes(req.user.type)) {
                return res.status(403).json({ status: 'error', message: 'Unauthorized' });
            }

            const threshold = req.query.threshold || 10;
            const items = await itemsService.getLowStockItems(parseInt(threshold));
            res.status(200).json({ status: 'success', count: items.length, items });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    /**
     * Update item quantity
     */
    updateQuantity: async (req, res) => {
        try {
            if (!['manager'].includes(req.user.type)) {
                return res.status(403).json({ status: 'error', message: 'Unauthorized' });
            }

            const { quantityChange } = req.body;
            if (quantityChange === undefined) {
                return res.status(400).json({ status: 'error', message: 'quantityChange is required' });
            }

            const item = await itemsService.updateQuantity(req.params.id, quantityChange);
            res.status(200).json({ status: 'success', item });
        } catch (error) {
            res.status(error.message.includes('not found') ? 404 : 400).json({ 
                status: 'error', 
                message: error.message 
            });
        }
    }

};

module.exports = itemsController;
