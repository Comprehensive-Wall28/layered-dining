const UserModel = require('../models/user');
const LogModel = require('../models/log');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authService = {

    /**
     * Log users in, return token
     * @param {string} email - The user's email address.
     * @param {string} password - The user's plain text password.
     * @returns {string} The generated JSON Web Token (JWT).
     * @throws {Error} If login fails due to bad credentials.
     */
    async login(email, password) {
        // 1. Find the user by email
        const user = await UserModel.findOne({ email });

        if (!user) {
            const error = new Error('Invalid credentials');
            error.code = 401;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const error = new Error('Invalid credentials');
            error.code = 401;

            const log = new LogModel({ //Log action
                action: 'LOG_IN',
                description: 'User failed to provide correct password',
                severity: 'IMPORTANT',
                type: 'FAILURE',
                userId: user._id,
            });
            await log.save();
            throw error;
        }

        const token = jwt.sign(
            { user: { id: user._id, email: user.email, role: user.role } },
            process.env.SECRET_KEY,
            { expiresIn: '1d' }
        );
        //Save new log
        const log = new LogModel({
            action: 'LOG_IN',
            description: 'User logged in successfully',
            severity: 'NOTICE',
            type: 'SUCCESS',
            userId: user._id,
        });
        await log.save();

        return token;
    },

    /**
  * Register users
  * @param {string} email - The user's email address.
  * @param {string} password - The user's password.
  * @param {string} role - The user's role
  * @returns {string} User details.
  * @throws {Error} If login fails due to bad credentials.
  */
    async registerUser(email, password, name, role) {

        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            const error = new Error('A user with this email address already exists.');
            error.code = 409;
            throw error;
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new User document
        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            role: role || 'Customer'
        });

        // Save the new user to the database
        await newUser.save();

        const log = new LogModel({
            action: 'CREATE',
            description: 'New User created successfully',
            severity: 'NOTICE',
            type: 'SUCCESS',
            userId: newUser._id,
        });
        await log.save();

        return {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            cart: newUser.cart
        };
    },

    async deleteAccount(userId) {
        const user = await UserModel.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.code = 404;
            throw error;
        }

        await UserModel.findByIdAndDelete(userId);

        const log = new LogModel({
            action: 'DELETE',
            description: 'User account deleted successfully',
            severity: 'IMPORTANT',
            type: 'SUCCESS',
            userId: userId, // Log against the deleted user ID even if it's gone from Users collection for audit
        });
        await log.save();

        return { message: 'Account deleted successfully' };
    },
};

module.exports = authService;