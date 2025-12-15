const TableModel = require('../models/table');
const LogModel = require('../models/log');

const tableService = {

    /**
     * Create a new table (Admin/Manager only)
     * @param {Object} tableData - Table details
     * @param {Object} user - User creating the table
     * @returns {Object} Created table
     */
    async createTable(tableData, user) {
        try {
            const { tableNumber, capacity, location, features } = tableData;

            // Check if table number already exists
            const existingTable = await TableModel.findOne({ tableNumber });
            if (existingTable) {
                const error = new Error('Table with this number already exists');
                error.code = 409;
                throw error;
            }

            const newTable = new TableModel({
                tableNumber,
                capacity,
                location: location || 'Indoor',
                status: 'Available',
                features: features || [],
                createdBy: user.id
            });

            await newTable.save();

            // Create log entry
            const log = new LogModel({
                action: 'CREATE',
                description: `Table ${tableNumber} created with capacity ${capacity}`,
                affectedDocument: newTable._id,
                affectedModel: 'Table',
                severity: 'NOTICE',
                type: 'SUCCESS',
                userId: user.id,
            });
            await log.save();

            return newTable;

        } catch (error) {
            if (error.code) throw error;
            const err = new Error('Error creating table: ' + error.message);
            err.code = 500;
            throw err;
        }
    },

    /**
     * Get all tables
     * @returns {Array} All tables
     */
    async getAllTables() {
        try {
            const tables = await TableModel.find().sort({ tableNumber: 1 });
            return tables;

        } catch (error) {
            const err = new Error('Error fetching tables: ' + error.message);
            err.code = 500;
            throw err;
        }
    },

    /**
     * Get tables created by a specific user
     * @param {String} userId - User ID
     * @returns {Array} Tables created by the user
     */
    async getTablesByCreator(userId) {
        try {
            const tables = await TableModel.find({ createdBy: userId })
                .populate('createdBy', 'name email role')
                .sort({ tableNumber: 1 });
            return tables;

        } catch (error) {
            const err = new Error('Error fetching user tables: ' + error.message);
            err.code = 500;
            throw err;
        }
    },

    /**
     * Get table by ID
     * @param {String} tableId - Table ID
     * @returns {Object} Table
     */
    async getTableById(tableId) {
        try {
            const table = await TableModel.findById(tableId);

            if (!table) {
                const error = new Error('Table not found');
                error.code = 404;
                throw error;
            }

            return table;

        } catch (error) {
            if (error.code) throw error;
            const err = new Error('Error fetching table: ' + error.message);
            err.code = 500;
            throw err;
        }
    },

    /**
     * Update table
     * @param {String} tableId - Table ID
     * @param {Object} updates - Fields to update
     * @param {Object} user - User performing update
     * @returns {Object} Updated table
     */
    async updateTable(tableId, updates, user) {
        try {
            const table = await TableModel.findById(tableId);

            if (!table) {
                const error = new Error('Table not found');
                error.code = 404;
                throw error;
            }

            // Update allowed fields
            if (updates.tableNumber) table.tableNumber = updates.tableNumber;
            if (updates.capacity) table.capacity = updates.capacity;
            if (updates.location) table.location = updates.location;
            if (updates.status) table.status = updates.status;
            if (updates.features) table.features = updates.features;

            await table.save();

            // Create log entry
            const log = new LogModel({
                action: 'UPDATE',
                description: `Table ${table.tableNumber} updated`,
                affectedDocument: table._id,
                affectedModel: 'Table',
                severity: 'NOTICE',
                type: 'SUCCESS',
                userId: user.id,
            });
            await log.save();

            return table;

        } catch (error) {
            if (error.code) throw error;
            const err = new Error('Error updating table: ' + error.message);
            err.code = 500;
            throw err;
        }
    },

    /**
     * Delete table
     * @param {String} tableId - Table ID
     * @param {Object} user - User performing deletion
     * @returns {Object} Deletion confirmation
     */
    async deleteTable(tableId, user) {
        try {
            const table = await TableModel.findByIdAndDelete(tableId);

            if (!table) {
                const error = new Error('Table not found');
                error.code = 404;
                throw error;
            }

            // Create log entry
            const log = new LogModel({
                action: 'DELETE',
                description: `Table ${table.tableNumber} deleted`,
                severity: 'IMPORTANT',
                type: 'SUCCESS',
                userId: user.id,
            });
            await log.save();

            return {
                message: 'Table deleted successfully',
                tableNumber: table.tableNumber
            };

        } catch (error) {
            if (error.code) throw error;
            const err = new Error('Error deleting table: ' + error.message);
            err.code = 500;
            throw err;
        }
    }
};

module.exports = tableService;
