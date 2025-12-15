const userService = require('../services/user.service');
const UserModel = require('../models/user');
const LogModel = require('../models/log');
const FeedbackModel = require('../models/feedback');
const OrderModel = require('../models/order');
const ReservationModel = require('../models/reservation');

jest.mock('../models/user');
jest.mock('../models/log');
jest.mock('../models/feedback');
jest.mock('../models/order');
jest.mock('../models/reservation');

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('deleteAccount', () => {
        it('should delete user account successfully', async () => {
            const mockUser = {
                _id: 'user123',
                name: 'Test User',
                email: 'test@example.com'
            };

            UserModel.findByIdAndDelete.mockResolvedValue(mockUser);
            LogModel.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(true)
            }));

            const result = await userService.deleteAccount('user123');

            expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith('user123');
            expect(LogModel).toHaveBeenCalled();
            expect(result).toEqual({
                id: 'user123',
                name: 'Test User',
                email: 'test@example.com',
                message: 'User deleted successfully'
            });
        });

        it('should throw error if user not found', async () => {
            UserModel.findByIdAndDelete.mockResolvedValue(null);

            await expect(userService.deleteAccount('user123')).rejects.toThrow('User not found');
        });
    });

    describe('getCurrentUser', () => {
        it('should return user details', async () => {
            const mockUser = {
                _id: 'user123',
                name: 'Test User',
                email: 'test@example.com',
                role: 'Customer'
            };
            UserModel.findById.mockResolvedValue(mockUser);

            const result = await userService.getCurrentUser('user123');

            expect(result).toEqual({
                id: 'user123',
                name: 'Test User',
                email: 'test@example.com',
                role: 'Customer'
            });
        });

        it('should throw error if ID not provided', async () => {
            await expect(userService.getCurrentUser(null)).rejects.toThrow('No ID provided');
        });

        it('should throw error if user not found', async () => {
            UserModel.findById.mockResolvedValue(null);
            await expect(userService.getCurrentUser('user123')).rejects.toThrow('User not found');
        });
    });

    describe('updateUserProfile', () => {
        it('should update user profile', async () => {
            const mockUser = {
                _id: 'user123',
                name: 'Old Name',
                email: 'old@example.com',
                save: jest.fn().mockResolvedValue(true)
            };
            UserModel.findById.mockResolvedValue(mockUser);
            LogModel.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(true)
            }));

            const result = await userService.updateUserProfile('user123', 'New Name', 'new@example.com', 'newpass');

            expect(mockUser.name).toBe('New Name');
            expect(mockUser.email).toBe('new@example.com');
            expect(mockUser.password).toBe('newpass');
            expect(mockUser.save).toHaveBeenCalled();
            expect(LogModel).toHaveBeenCalled();
            expect(result.message).toBe('User updated successfully!');
        });

        it('should throw error if user not found', async () => {
            UserModel.findById.mockResolvedValue(null);
            await expect(userService.updateUserProfile('user123')).rejects.toThrow('User not found');
        });
    });

    describe('getLogs', () => {
        it('should return logs for user', async () => {
            const mockLogs = [{ action: 'LOGIN' }];
            LogModel.find.mockResolvedValue(mockLogs);

            const result = await userService.getLogs('user123');
            expect(result).toEqual(mockLogs);
        });

        it('should throw error if ID not provided', async () => {
            await expect(userService.getLogs(null)).rejects.toThrow('No ID provided');
        });
    });

    describe('getCartId', () => {
        it('should return cart ID for user', async () => {
            const mockUser = { _id: 'user123', cart: 'cart123' };
            UserModel.findById.mockResolvedValue(mockUser);

            const result = await userService.getCartId('user123');
            expect(result).toBe('cart123');
        });

        it('should throw error if ID not provided', async () => {
            await expect(userService.getCartId(null)).rejects.toThrow('No ID provided');
        });

        it('should throw error if user not found', async () => {
            UserModel.findById.mockResolvedValue(null);
            await expect(userService.getCartId('user123')).rejects.toThrow('User not found');
        });
    });

    describe('setCartId', () => {
        it('should set cart ID for user', async () => {
            const mockUser = {
                _id: 'user123',
                cart: null,
                save: jest.fn().mockResolvedValue(true)
            };
            UserModel.findById.mockResolvedValue(mockUser);

            const result = await userService.setCartId('user123', 'cart123');

            expect(mockUser.cart).toBe('cart123');
            expect(mockUser.save).toHaveBeenCalled();
            expect(result).toBe('cart123');
        });

        it('should throw error if user ID not provided', async () => {
            await expect(userService.setCartId(null, 'cart123')).rejects.toThrow('No user ID provided');
        });

        it('should throw error if user not found', async () => {
            UserModel.findById.mockResolvedValue(null);
            await expect(userService.setCartId('user123', 'cart123')).rejects.toThrow('User not found');
        });
    });

    describe('createFeedback', () => {
        it('should create feedback successfully', async () => {
            const mockFeedback = {
                save: jest.fn().mockResolvedValue(true),
                userId: 'user123',
                feedback: 'Great!',
                rating: 5
            };
            FeedbackModel.mockImplementation(() => mockFeedback);

            const result = await userService.createFeedback('user123', 'Great!', 5);

            expect(FeedbackModel).toHaveBeenCalledWith({
                userId: 'user123',
                feedback: 'Great!',
                rating: 5
            });
            expect(mockFeedback.save).toHaveBeenCalled();
        });

        it('should throw error if parameters missing', async () => {
            await expect(userService.createFeedback('user123', null, 5)).rejects.toThrow('Missing required fields');
            await expect(userService.createFeedback(null, 'Great!', 5)).rejects.toThrow('Missing required fields');
            await expect(userService.createFeedback('user123', 'Great!', null)).rejects.toThrow('Missing required fields');
        });
    });

    describe('getFeedback', () => {
        it('should return feedback for user', async () => {
            const mockFeedback = [{ feedback: 'Great!' }];
            FeedbackModel.find.mockResolvedValue(mockFeedback);

            const result = await userService.getFeedback('user123');
            expect(result).toEqual(mockFeedback);
        });

        it('should throw error if no user ID', async () => {
            await expect(userService.getFeedback(null)).rejects.toThrow('No user ID provided');
        });

        it('should throw error if no feedback found', async () => {
            FeedbackModel.find.mockResolvedValue([]);
            await expect(userService.getFeedback('user123')).rejects.toThrow('No feedback found for this user');
        });
    });

    describe('getAllFeedback', () => {
        it('should return paginated feedback', async () => {
            const mockFeedback = [{ feedback: 'Great!' }];
            const mockFind = {
                populate: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockFeedback)
            };
            FeedbackModel.find.mockReturnValue(mockFind);
            FeedbackModel.countDocuments.mockResolvedValue(10);

            const result = await userService.getAllFeedback({ page: 1, limit: 10 });

            expect(result.feedback).toEqual(mockFeedback);
            expect(result.total).toBe(10);
            expect(result.page).toBe(1);
            expect(result.pages).toBe(1);
        });
    });

    describe('deleteFeedback', () => {
        it('should delete feedback successfully', async () => {
            const mockFeedback = { _id: 'f123' };
            FeedbackModel.findByIdAndDelete.mockResolvedValue(mockFeedback);

            const result = await userService.deleteFeedback('f123');
            expect(result).toEqual(mockFeedback);
        });

        it('should throw error if ID not provided', async () => {
            await expect(userService.deleteFeedback(null)).rejects.toThrow('No feedback ID provided');
        });

        it('should throw error if feedback not found', async () => {
            FeedbackModel.findByIdAndDelete.mockResolvedValue(null);
            await expect(userService.deleteFeedback('f123')).rejects.toThrow('Feedback not found');
        });
    });

    describe('getAllUsers', () => {
        it('should return paginated users with search', async () => {
            const mockUsers = [{ name: 'User1' }];
            const mockFind = {
                select: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockUsers)
            };
            UserModel.find.mockReturnValue(mockFind);
            UserModel.countDocuments.mockResolvedValue(10);

            const result = await userService.getAllUsers({ page: 1, limit: 10, search: 'test' });

            expect(UserModel.find).toHaveBeenCalledWith(expect.objectContaining({
                $or: [
                    { name: { $regex: 'test', $options: 'i' } },
                    { email: { $regex: 'test', $options: 'i' } }
                ]
            }));
            expect(result.users).toEqual(mockUsers);
        });
    });

    describe('adminUpdateUser', () => {
        it('should update user by admin', async () => {
            const mockUser = {
                _id: 'user123',
                name: 'Old',
                email: 'old@ex.com',
                role: 'Customer',
                save: jest.fn().mockResolvedValue(true)
            };
            const updates = { name: 'New', role: 'Admin' };

            UserModel.findById.mockResolvedValue(mockUser);
            LogModel.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(true)
            }));

            const result = await userService.adminUpdateUser('user123', updates);

            expect(mockUser.name).toBe('New');
            expect(mockUser.role).toBe('Admin');
            expect(mockUser.save).toHaveBeenCalled();
            expect(LogModel).toHaveBeenCalled();
        });

        it('should throw error if user not found', async () => {
            UserModel.findById.mockResolvedValue(null);
            await expect(userService.adminUpdateUser('user123', {})).rejects.toThrow('User not found');
        });
    });

    describe('getDashboardStats', () => {
        it('should return combined stats', async () => {
            const orderStats = [{ _id: '2023-01-01', orders: 5 }];
            const reservationStats = [{ _id: '2023-01-01', reservations: 3 }];

            OrderModel.aggregate.mockResolvedValue(orderStats);
            ReservationModel.aggregate.mockResolvedValue(reservationStats);

            const result = await userService.getDashboardStats();

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                date: '2023-01-01',
                orders: 5,
                reservations: 3
            });
        });
    });
});
