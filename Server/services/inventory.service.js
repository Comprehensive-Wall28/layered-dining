const Item = require("../models/inventory");

const itemsService = {
    /**
     * Get all items with optional filters
     */
    getAllItems: async (filters = {}) => {
        try {
            const query = {};
            
            // Add filters if provided
            if (filters.status) {
                query.status = filters.status;
            }
            if (filters.name) {
                query.name = { $regex: filters.name, $options: 'i' };
            }
            
            const items = await Item.find(query).sort({ createdAt: -1 });
            return items;
        } catch (error) {
            throw new Error(`Error fetching items: ${error.message}`);
        }
    },

    /**
     * Get a single item by ID
     */
    getItemById: async (itemId) => {
        try {
            const item = await Item.findById(itemId);
            if (!item) {
                throw new Error('Item not found');
            }
            return item;
        } catch (error) {
            throw new Error(`Error fetching item: ${error.message}`);
        }
    },

    /**
     * Create a new item
     */
    createItem: async (itemData) => {
        try {
            // Validate required fields
            if (!itemData.name || itemData.quantity === undefined) {
                throw new Error('Name and quantity are required');
            }

            const newItem = new Item(itemData);
            await newItem.save();
            return newItem;
        } catch (error) {
            throw new Error(`Error creating item: ${error.message}`);
        }
    },

    /**
     * Update an item
     */
    updateItem: async (itemId, updateData) => {
        try {
            const item = await Item.findByIdAndUpdate(itemId, updateData, { new: true, runValidators: true });
            if (!item) {
                throw new Error('Item not found');
            }
            return item;
        } catch (error) {
            throw new Error(`Error updating item: ${error.message}`);
        }
    },

    /**
     * Delete an item
     */
    deleteItem: async (itemId) => {
        try {
            const item = await Item.findByIdAndDelete(itemId);
            if (!item) {
                throw new Error('Item not found');
            }
            return item;
        } catch (error) {
            throw new Error(`Error deleting item: ${error.message}`);
        }
    },

    /**
     * Check item expiration status
     */
    checkExpirationStatus: async (itemId) => {
        try {
            const item = await Item.findById(itemId);
            if (!item) {
                throw new Error('Item not found');
            }

            if (!item.expirationDate) {
                return { status: 'Safe to Consume', message: 'No expiration date set' };
            }

            const now = new Date();
            const expiryDate = new Date(item.expirationDate);
            const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));

            if (daysUntilExpiry < 0) {
                return { status: 'Expired', message: `Expired ${Math.abs(daysUntilExpiry)} days ago` };
            } else if (daysUntilExpiry <= 3) {
                return { status: 'Expires soon', message: `Expires in ${daysUntilExpiry} days` };
            }

            return { status: 'Safe to Consume', message: `Expires in ${daysUntilExpiry} days` };
        } catch (error) {
            throw new Error(`Error checking expiration: ${error.message}`);
        }
    },

    /**
     * Get low stock items
     */
    getLowStockItems: async (threshold = 10) => {
        try {
            const items = await Item.find({ quantity: { $lt: threshold } });
            return items;
        } catch (error) {
            throw new Error(`Error fetching low stock items: ${error.message}`);
        }
    },

    /**
     * Update item quantity
     */
    updateQuantity: async (itemId, quantityChange) => {
        try {
            const item = await Item.findById(itemId);
            if (!item) {
                throw new Error('Item not found');
            }

            const newQuantity = item.quantity + quantityChange;
            if (newQuantity < 0) {
                throw new Error('Quantity cannot be negative');
            }

            item.quantity = newQuantity;
            await item.save();
            return item;
        } catch (error) {
            throw new Error(`Error updating quantity: ${error.message}`);
        }
    }
};

module.exports = itemsService;
