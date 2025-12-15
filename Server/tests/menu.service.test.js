const menuService = require('../services/menu.service');
const MenuItem = require('../models/menu');
const LogModel = require('../models/log');

jest.mock('../models/menu');
jest.mock('../models/log');

describe('MenuService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createMenuItem', () => {
        const mockMenuData = {
            name: 'Pizza',
            price: 10,
            category: 'Main'
        };
        const userId = 'user123';

        it('should create a new menu item successfully', async () => {
            const mockSavedItem = { ...mockMenuData, _id: 'menu123', save: jest.fn().mockResolvedValue(true) };

            MenuItem.findOne.mockResolvedValue(null);
            MenuItem.mockImplementation(() => mockSavedItem);
            LogModel.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(true)
            }));

            const result = await menuService.createMenuItem(mockMenuData, userId);

            expect(MenuItem.findOne).toHaveBeenCalledWith({ name: 'Pizza' });
            expect(mockSavedItem.save).toHaveBeenCalled();
            expect(LogModel).toHaveBeenCalled();
            expect(result).toEqual(mockSavedItem);
        });

        it('should throw 409 if menu item with name exists', async () => {
            MenuItem.findOne.mockResolvedValue({ _id: 'existing' });

            await expect(menuService.createMenuItem(mockMenuData, userId))
                .rejects.toThrow('Menu item with this name already exists');
        });

        it('should throw 500 on unexpected error', async () => {
            MenuItem.findOne.mockRejectedValue(new Error('DB Error'));

            await expect(menuService.createMenuItem(mockMenuData, userId))
                .rejects.toThrow('Failed to create menu item: DB Error');
        });
    });

    describe('getAllMenuItems', () => {
        it('should return all menu items sorted by createdAt', async () => {
            const mockItems = [{ name: 'Pizza' }];
            const mockFind = {
                sort: jest.fn().mockResolvedValue(mockItems)
            };
            MenuItem.find.mockReturnValue(mockFind);

            const result = await menuService.getAllMenuItems();

            expect(MenuItem.find).toHaveBeenCalledWith({});
            expect(mockFind.sort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(result).toEqual(mockItems);
        });

        it('should filter by category and isAvailable', async () => {
            const mockItems = [{ name: 'Pizza' }];
            const mockFind = {
                sort: jest.fn().mockResolvedValue(mockItems)
            };
            MenuItem.find.mockReturnValue(mockFind);

            await menuService.getAllMenuItems({ category: 'Main', isAvailable: true });

            expect(MenuItem.find).toHaveBeenCalledWith({ category: 'Main', isAvailable: true });
        });

        it('should throw 500 on error', async () => {
            MenuItem.find.mockImplementation(() => { throw new Error('DB Error') });

            await expect(menuService.getAllMenuItems())
                .rejects.toThrow('Failed to fetch menu items: DB Error');
        });
    });

    describe('getMenuItemById', () => {
        it('should return menu item if found', async () => {
            const mockItem = { _id: '123', name: 'Pizza' };
            MenuItem.findById.mockResolvedValue(mockItem);

            const result = await menuService.getMenuItemById('123');

            expect(result).toEqual(mockItem);
        });

        it('should throw 400 if no ID provided', async () => {
            await expect(menuService.getMenuItemById(null))
                .rejects.toThrow('No ID provided');
        });

        it('should throw 404 if not found', async () => {
            MenuItem.findById.mockResolvedValue(null);

            await expect(menuService.getMenuItemById('123'))
                .rejects.toThrow('Menu item not found');
        });

        it('should throw 500 on unexpected error', async () => {
            MenuItem.findById.mockRejectedValue(new Error('DB Error'));

            await expect(menuService.getMenuItemById('123'))
                .rejects.toThrow('Failed to fetch menu item: DB Error');
        });
    });

    describe('updateMenuItem', () => {
        const updateData = { name: 'New Pizza', price: 12 };
        const userId = 'user123';

        it('should update menu item successfully', async () => {
            const mockUpdatedItem = { _id: '123', ...updateData };

            MenuItem.findOne.mockResolvedValue(null); // No duplicate name
            MenuItem.findByIdAndUpdate.mockResolvedValue(mockUpdatedItem);
            LogModel.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(true)
            }));

            const result = await menuService.updateMenuItem('123', updateData, userId);

            expect(MenuItem.findByIdAndUpdate).toHaveBeenCalledWith(
                '123',
                expect.objectContaining(updateData),
                expect.objectContaining({ new: true, runValidators: true })
            );
            expect(result).toEqual(mockUpdatedItem);
        });

        it('should throw 400 if no ID', async () => {
            await expect(menuService.updateMenuItem(null, updateData, userId))
                .rejects.toThrow('No ID provided');
        });

        it('should throw 409 if name duplicate exists', async () => {
            MenuItem.findOne.mockResolvedValue({ _id: 'other' });

            await expect(menuService.updateMenuItem('123', updateData, userId))
                .rejects.toThrow('Another menu item with this name already exists');
        });

        it('should throw 404 if item not found', async () => {
            MenuItem.findOne.mockResolvedValue(null);
            MenuItem.findByIdAndUpdate.mockResolvedValue(null);

            await expect(menuService.updateMenuItem('123', updateData, userId))
                .rejects.toThrow('Menu item not found');
        });
    });

    describe('deleteMenuItem', () => {
        const userId = 'user123';

        it('should delete menu item successfully', async () => {
            const mockDeletedItem = { _id: '123', name: 'Pizza' };
            MenuItem.findByIdAndDelete.mockResolvedValue(mockDeletedItem);
            LogModel.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(true)
            }));

            const result = await menuService.deleteMenuItem('123', userId);

            expect(MenuItem.findByIdAndDelete).toHaveBeenCalledWith('123');
            expect(result).toEqual({
                message: 'Menu item deleted successfully',
                deletedItem: { id: '123', name: 'Pizza' }
            });
        });

        it('should throw 400 if no ID', async () => {
            await expect(menuService.deleteMenuItem(null, userId))
                .rejects.toThrow('No ID provided');
        });

        it('should throw 404 if item not found', async () => {
            MenuItem.findByIdAndDelete.mockResolvedValue(null);

            await expect(menuService.deleteMenuItem('123', userId))
                .rejects.toThrow('Menu item not found');
        });
    });

    describe('getMenuItemsByCategory', () => {
        it('should return available items by category', async () => {
            const mockItems = [{ name: 'Pizza' }];
            const mockFind = {
                sort: jest.fn().mockResolvedValue(mockItems)
            };
            MenuItem.find.mockReturnValue(mockFind);

            const result = await menuService.getMenuItemsByCategory('Main');

            expect(MenuItem.find).toHaveBeenCalledWith({ category: 'Main', isAvailable: true });
            expect(mockFind.sort).toHaveBeenCalledWith({ name: 1 });
            expect(result).toEqual(mockItems);
        });

        it('should throw 500 on error', async () => {
            MenuItem.find.mockImplementation(() => { throw new Error('DB Error') });

            await expect(menuService.getMenuItemsByCategory('Main'))
                .rejects.toThrow('Failed to fetch menu items by category: DB Error');
        });
    });
});
