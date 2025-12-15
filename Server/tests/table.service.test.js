const tableService = require('../services/table.service');
const TableModel = require('../models/table');
const LogModel = require('../models/log');

jest.mock('../models/table');
jest.mock('../models/log');

describe('TableService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createTable', () => {
        const tableData = {
            tableNumber: 1,
            capacity: 4,
            location: 'Indoor'
        };
        const user = { id: 'admin1' };

        it('should create a table successfully', async () => {
            const mockSavedTable = { ...tableData, _id: 't1', save: jest.fn().mockResolvedValue(true) };

            TableModel.findOne.mockResolvedValue(null);
            TableModel.mockImplementation(() => mockSavedTable);
            LogModel.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(true) }));

            const result = await tableService.createTable(tableData, user);

            expect(TableModel.findOne).toHaveBeenCalledWith({ tableNumber: 1 });
            expect(mockSavedTable.save).toHaveBeenCalled();
            expect(LogModel).toHaveBeenCalled();
            expect(result).toEqual(mockSavedTable);
        });

        it('should throw 409 if table number exists', async () => {
            TableModel.findOne.mockResolvedValue({ _id: 'existing' });
            await expect(tableService.createTable(tableData, user)).rejects.toThrow('Table with this number already exists');
        });

        it('should throw 500 on db error', async () => {
            TableModel.findOne.mockRejectedValue(new Error('DB Error'));
            await expect(tableService.createTable(tableData, user)).rejects.toThrow('Error creating table: DB Error');
        });
    });

    describe('getAllTables', () => {
        it('should return all tables sorted', async () => {
            const mockTables = [{ tableNumber: 1 }];
            const mockFind = { sort: jest.fn().mockResolvedValue(mockTables) };
            TableModel.find.mockReturnValue(mockFind);

            const result = await tableService.getAllTables();
            expect(mockFind.sort).toHaveBeenCalledWith({ tableNumber: 1 });
            expect(result).toEqual(mockTables);
        });

        it('should throw 500 on error', async () => {
            TableModel.find.mockImplementation(() => { throw new Error('DB Error') });
            await expect(tableService.getAllTables()).rejects.toThrow('Error fetching tables: DB Error');
        });
    });

    describe('getTablesByCreator', () => {
        it('should return tables by creator', async () => {
            const mockTables = [{ tableNumber: 1 }];
            const mockChain = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockTables)
            };
            TableModel.find.mockReturnValue(mockChain);

            const result = await tableService.getTablesByCreator('user1');
            expect(TableModel.find).toHaveBeenCalledWith({ createdBy: 'user1' });
            expect(result).toEqual(mockTables);
        });

        it('should throw 500 on error', async () => {
            TableModel.find.mockImplementation(() => { throw new Error('DB Error') });
            await expect(tableService.getTablesByCreator('u1')).rejects.toThrow('Error fetching user tables: DB Error');
        });
    });

    describe('getTableById', () => {
        it('should return table', async () => {
            const mockTable = { _id: 't1' };
            TableModel.findById.mockResolvedValue(mockTable);

            const result = await tableService.getTableById('t1');
            expect(result).toEqual(mockTable);
        });

        it('should throw 404 if not found', async () => {
            TableModel.findById.mockResolvedValue(null);
            await expect(tableService.getTableById('t1')).rejects.toThrow('Table not found');
        });

        it('should throw 500 on error', async () => {
            TableModel.findById.mockRejectedValue(new Error('DB Error'));
            await expect(tableService.getTableById('t1')).rejects.toThrow('Error fetching table: DB Error');
        });
    });

    describe('updateTable', () => {
        it('should update table', async () => {
            const mockTable = {
                _id: 't1',
                tableNumber: 1,
                save: jest.fn().mockResolvedValue(true)
            };
            TableModel.findById.mockResolvedValue(mockTable);
            LogModel.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(true) }));

            await tableService.updateTable('t1', { capacity: 6 }, { id: 'admin1' });

            expect(mockTable.capacity).toBe(6);
            expect(mockTable.save).toHaveBeenCalled();
        });

        it('should throw 404 if not found', async () => {
            TableModel.findById.mockResolvedValue(null);
            await expect(tableService.updateTable('t1', {}, { id: 'a1' })).rejects.toThrow('Table not found');
        });
    });

    describe('deleteTable', () => {
        it('should delete table', async () => {
            const mockTable = { _id: 't1', tableNumber: 1 };
            TableModel.findByIdAndDelete.mockResolvedValue(mockTable);
            LogModel.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(true) }));

            const result = await tableService.deleteTable('t1', { id: 'a1' });

            expect(result.message).toBe('Table deleted successfully');
            expect(LogModel).toHaveBeenCalled();
        });

        it('should throw 404 if not found', async () => {
            TableModel.findByIdAndDelete.mockResolvedValue(null);
            await expect(tableService.deleteTable('t1', { id: 'a1' })).rejects.toThrow('Table not found');
        });
    });
});
