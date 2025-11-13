const MenuItem = require('../models/menu');
const LogModel = require('../models/log');

const menuService = {
    async createMenuItem(menuData, userId) {
        try {
            const existingItem = await MenuItem.findOne({ name: menuData.name });
            if (existingItem) {
                const error = new Error('Menu item with this name already exists');
                error.code = 409;
                throw error;
            }

            const newMenuItem = new MenuItem(menuData);
            await newMenuItem.save();

            const log = new LogModel({
                action: 'CREATE',
                description: `Menu item "${newMenuItem.name}" created successfully`,
                severity: 'NOTICE',
                type: 'ADMINISTRATIVE',
                userId: userId,
                affectedDocument: newMenuItem._id,
                affectedModel: 'Menu'
            });
            await log.save();

            return newMenuItem;
        } catch (error) {
            if (error.code) throw error;
            const newError = new Error('Failed to create menu item: ' + error.message);
            newError.code = 500;
            throw newError;
        }
    },

    async getAllMenuItems(filters = {}) {
        try {
            const query = {};

            if (filters.category) {
                query.category = filters.category;
            }

            if (filters.isAvailable !== undefined) {
                query.isAvailable = filters.isAvailable;
            }

            const menuItems = await MenuItem.find(query).sort({ createdAt: -1 });
            return menuItems;
        } catch (error) {
            const newError = new Error('Failed to fetch menu items: ' + error.message);
            newError.code = 500;
            throw newError;
        }
    },

    async getMenuItemById(id) {
        try {
            if (!id) {
                const error = new Error('No ID provided');
                error.code = 400;
                throw error;
            }

            const menuItem = await MenuItem.findById(id);
            if (!menuItem) {
                const error = new Error('Menu item not found');
                error.code = 404;
                throw error;
            }

            return menuItem;
        } catch (error) {
            if (error.code) throw error;
            const newError = new Error('Failed to fetch menu item: ' + error.message);
            newError.code = 500;
            throw newError;
        }
    },

    async updateMenuItem(id, updateData, userId) {
        try {
            if (!id) {
                const error = new Error('No ID provided');
                error.code = 400;
                throw error;
            }

            if (updateData.name) {
                const existingItem = await MenuItem.findOne({
                    name: updateData.name,
                    _id: { $ne: id }
                });
                if (existingItem) {
                    const error = new Error('Another menu item with this name already exists');
                    error.code = 409;
                    throw error;
                }
            }

            const updatedMenuItem = await MenuItem.findByIdAndUpdate(
                id,
                { ...updateData, updatedAt: Date.now() },
                { new: true, runValidators: true }
            );

            if (!updatedMenuItem) {
                const error = new Error('Menu item not found');
                error.code = 404;
                throw error;
            }

            const log = new LogModel({
                action: 'UPDATE',
                description: `Menu item "${updatedMenuItem.name}" updated successfully`,
                severity: 'NOTICE',
                type: 'ADMINISTRATIVE',
                userId: userId,
                affectedDocument: updatedMenuItem._id,
                affectedModel: 'Menu'
            });
            await log.save();

            return updatedMenuItem;
        } catch (error) {
            if (error.code) throw error;
            const newError = new Error('Failed to update menu item: ' + error.message);
            newError.code = 500;
            throw newError;
        }
    },

    async deleteMenuItem(id, userId) {
        try {
            if (!id) {
                const error = new Error('No ID provided');
                error.code = 400;
                throw error;
            }

            const deletedMenuItem = await MenuItem.findByIdAndDelete(id);
            if (!deletedMenuItem) {
                const error = new Error('Menu item not found');
                error.code = 404;
                throw error;
            }

            const log = new LogModel({
                action: 'DELETE',
                description: `Menu item "${deletedMenuItem.name}" deleted successfully`,
                severity: 'NOTICE',
                type: 'ADMINISTRATIVE',
                userId: userId,
                affectedDocument: deletedMenuItem._id,
                affectedModel: 'Menu'
            });
            await log.save();

            return {
                message: 'Menu item deleted successfully',
                deletedItem: {
                    id: deletedMenuItem._id,
                    name: deletedMenuItem.name
                }
            };
        } catch (error) {
            if (error.code) throw error;
            const newError = new Error('Failed to delete menu item: ' + error.message);
            newError.code = 500;
            throw newError;
        }
    },

    async getMenuItemsByCategory(category) {
        try {
            const menuItems = await MenuItem.find({
                category: category,
                isAvailable: true
            }).sort({ name: 1 });

            return menuItems;
        } catch (error) {
            const newError = new Error('Failed to fetch menu items by category: ' + error.message);
            newError.code = 500;
            throw newError;
        }
    },

    async searchMenuItems(searchTerm) {
        try {
            const menuItems = await MenuItem.find({
                $and: [
                    { isAvailable: true },
                    {
                        $or: [
                            { name: { $regex: searchTerm, $options: 'i' } },
                            { description: { $regex: searchTerm, $options: 'i' } },
                            { tags: { $in: [new RegExp(searchTerm, 'i')] } }
                        ]
                    }
                ]
            }).sort({ name: 1 });

            return menuItems;
        } catch (error) {
            const newError = new Error('Failed to search menu items: ' + error.message);
            newError.code = 500;
            throw newError;
        }
    }
};

module.exports = menuService;