const managerService = require('../services/manager.service');
const customerService = require('../services/user.service');

jest.mock('../services/user.service');
jest.mock('../controllers/manager.controller', () => ({
    acceptOrder: jest.fn()
}));

describe('ManagerService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getCurrentUser', () => {
        it('should call customerService.getCurrentUser', async () => {
            const userId = 'user123';
            customerService.getCurrentUser.mockResolvedValue({ id: userId });

            await managerService.getCurrentUser(userId);

            expect(customerService.getCurrentUser).toHaveBeenCalledWith(userId);
        });
    });

    describe('updateOrderStatus', () => {
        it('should update status when newStatus is provided', async () => {
            const context = { status: '' };
            // Binding context just in case, though the service method uses `this` which is weird in singleton unless bound or class instance
            await managerService.updateOrderStatus.call(context, { newStatus: 'Accepted' });
            expect(context.status).toBe('Accepted');
        });

        it('should throw error if newStatus is null', async () => {
            await expect(managerService.updateOrderStatus({ newStatus: null })).rejects.toThrow('status is required');
        });
    });
});
