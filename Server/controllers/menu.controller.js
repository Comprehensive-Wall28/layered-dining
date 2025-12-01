const menuService = require('../services/menu.service');

const menuController = {
    createMenuItem: async (req, res) => {
        try {
            const menuData = req.body;
            const userId = req.user.id;

            const newMenuItem = await menuService.createMenuItem(menuData, userId);

            res.status(201).json({
                status: 'success',
                message: 'Menu item created successfully',
                menuItem: newMenuItem
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    },

    getAllMenuItems: async (req, res) => {
        try {
            const filters = req.query;
            const menuItems = await menuService.getAllMenuItems(filters);

            res.status(200).json({
                status: 'success',
                count: menuItems.length,
                menuItems
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    },

    getMenuItemById: async (req, res) => {
        try {
            const { id } = req.params;
            const menuItem = await menuService.getMenuItemById(id);

            res.status(200).json({
                status: 'success',
                menuItem
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    },

    updateMenuItem: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const userId = req.user.id;

            const updatedMenuItem = await menuService.updateMenuItem(id, updateData, userId);

            res.status(200).json({
                status: 'success',
                message: 'Menu item updated successfully',
                menuItem: updatedMenuItem
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    },

    deleteMenuItem: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const result = await menuService.deleteMenuItem(id, userId);

            res.status(200).json({
                status: 'success',
                message: result.message,
                deletedItem: result.deletedItem
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    },

    getMenuByCategory: async (req, res) => {
        try {
            const { category } = req.params;
            const menuItems = await menuService.getMenuItemsByCategory(category);

            res.status(200).json({
                status: 'success',
                category,
                count: menuItems.length,
                menuItems
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    },

};

module.exports = menuController;