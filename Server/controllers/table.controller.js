require("dotenv").config();
const tableService = require("../services/table.service");

const tableController = {

    /**
     * Create a new table (Admin/Manager only)
     */
    createTable: async (req, res) => {
        try {
            console.log('=== CREATE TABLE REQUEST ===');
            console.log('User:', req.user);
            console.log('Body:', req.body);
            
            const tableData = req.body;
            const user = req.user;

            // Validate required fields
            if (!tableData.tableNumber || !tableData.capacity) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Table number and capacity are required'
                });
            }

            const newTable = await tableService.createTable(tableData, user);

            res.status(201).json({
                status: 'success',
                message: 'Table created successfully',
                table: newTable
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    },

    /**
     * Get all tables
     */
    getAllTables: async (req, res) => {
        try {
            const tables = await tableService.getAllTables();

            res.status(200).json({
                status: 'success',
                count: tables.length,
                tables
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    },

    /**
     * Get tables created by the authenticated user
     */
    getMyTables: async (req, res) => {
        try {
            const userId = req.user.id;
            const tables = await tableService.getTablesByCreator(userId);

            res.status(200).json({
                status: 'success',
                count: tables.length,
                tables
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    },

    /**
     * Get table by ID
     */
    getTableById: async (req, res) => {
        try {
            const { id } = req.params;

            const table = await tableService.getTableById(id);

            res.status(200).json({
                status: 'success',
                table
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    },

    /**
     * Update table (Admin/Manager only)
     */
    updateTable: async (req, res) => {
        try {
            const { id } = req.params;
            const updates = req.body;
            const user = req.user;

            const updatedTable = await tableService.updateTable(id, updates, user);

            res.status(200).json({
                status: 'success',
                message: 'Table updated successfully',
                table: updatedTable
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    },

    /**
     * Delete table (Admin only)
     */
    deleteTable: async (req, res) => {
        try {
            const { id } = req.params;
            const user = req.user;

            const result = await tableService.deleteTable(id, user);

            res.status(200).json({
                status: 'success',
                message: result.message,
                tableNumber: result.tableNumber
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }
};

module.exports = tableController;
