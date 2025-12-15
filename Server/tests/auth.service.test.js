const authService = require('../services/auth.service');
const UserModel = require('../models/user');
const LogModel = require('../models/log');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../models/user');
jest.mock('../models/log');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should return a token when credentials are valid', async () => {
            const mockUser = {
                _id: 'user123',
                email: 'test@example.com',
                password: 'hashedPassword',
                role: 'Customer',
            };
            const mockToken = 'mockToken';

            UserModel.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue(mockToken);
            LogModel.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(true),
            }));

            const result = await authService.login('test@example.com', 'password123');

            expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(jwt.sign).toHaveBeenCalled();
            expect(result).toBe(mockToken);
        });

        it('should throw an error if user is not found', async () => {
            UserModel.findOne.mockResolvedValue(null);

            await expect(authService.login('wrong@example.com', 'password')).rejects.toThrow('Invalid credentials');
        });

        it('should throw an error and log failure if password is invalid', async () => {
            const mockUser = {
                _id: 'user123',
                email: 'test@example.com',
                password: 'hashedPassword',
            };
            const saveLogMock = jest.fn().mockResolvedValue(true);

            UserModel.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);
            LogModel.mockImplementation(() => ({
                save: saveLogMock,
            }));

            await expect(authService.login('test@example.com', 'wrongPassword')).rejects.toThrow('Invalid credentials');
            expect(saveLogMock).toHaveBeenCalled();
        });
    });

    describe('registerUser', () => {
        it('should register a new user successfully', async () => {
            const mockUser = {
                _id: 'new123',
                name: 'New User',
                email: 'new@example.com',
                cart: [],
                save: jest.fn().mockResolvedValue(true),
            };

            UserModel.findOne.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashedPassword');
            UserModel.mockImplementation(() => mockUser);
            LogModel.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(true),
            }));

            const result = await authService.registerUser('new@example.com', 'password123', 'New User', 'Customer');

            expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'new@example.com' });
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(mockUser.save).toHaveBeenCalled();
            expect(result).toEqual({
                id: 'new123',
                name: 'New User',
                email: 'new@example.com',
                cart: [],
            });
        });

        it('should throw an error if email already exists', async () => {
            UserModel.findOne.mockResolvedValue({ _id: 'existing' });

            await expect(authService.registerUser('existing@example.com', 'password', 'Name')).rejects.toThrow(
                'A user with this email address already exists.'
            );
        });
    });

    describe('deleteAccount', () => {
        it('should delete user account successfully', async () => {
            const mockUser = { _id: 'user123' };
            UserModel.findById.mockResolvedValue(mockUser);
            UserModel.findByIdAndDelete.mockResolvedValue(true);
            LogModel.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(true),
            }));

            const result = await authService.deleteAccount('user123');

            expect(UserModel.findById).toHaveBeenCalledWith('user123');
            expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith('user123');
            expect(result).toEqual({ message: 'Account deleted successfully' });
        });

        it('should throw error if user not found during deletion', async () => {
            UserModel.findById.mockResolvedValue(null);

            await expect(authService.deleteAccount('nonexistent123')).rejects.toThrow('User not found');
        });
    });
});
