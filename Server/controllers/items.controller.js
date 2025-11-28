require("dotenv").config();
const Item = require("../models/items"); // updated import
const User = require("../models/user");

// Controller object
const itemsController = {

    /**
     * Get all items (any logged-in user can view)
     */
    getAllItems: async (req, res) => {
        try {
            const items = await Item.find({});
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
            const item = await Item.findById(req.params.id);
            if (!item) return res.status(404).json({ status: 'error', message: 'Item not found' });

            res.status(200).json({ status: 'success', item });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    /**
     * Create a new item (Manager/Admin only)
     */
    createItem: async (req, res) => {
        try {
            if (!['manager', 'admin'].includes(req.user.type)) {
                return res.status(403).json({ status: 'error', message: 'Unauthorized' });
            }

            const newItem = new Item(req.body);
            await newItem.save();

            res.status(201).json({ status: 'success', item: newItem });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    /**
     * Update an item (Manager/Admin only)
     */
    updateItem: async (req, res) => {
        try {
            if (!['manager', 'admin'].includes(req.user.type)) {
                return res.status(403).json({ status: 'error', message: 'Unauthorized' });
            }

            const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!item) return res.status(404).json({ status: 'error', message: 'Item not found' });

            res.status(200).json({ status: 'success', item });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    /**
     * Delete an item (Manager/Admin only)
     */
    deleteItem: async (req, res) => {
        try {
            if (!['manager', 'admin'].includes(req.user.type)) {
                return res.status(403).json({ status: 'error', message: 'Unauthorized' });
            }

            const item = await Item.findByIdAndDelete(req.params.id);
            if (!item) return res.status(404).json({ status: 'error', message: 'Item not found' });

            res.status(200).json({ status: 'success', message: 'Item deleted successfully' });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

};

module.exports = itemsController;
