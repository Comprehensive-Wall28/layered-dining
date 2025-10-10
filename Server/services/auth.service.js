const UserModel = require('../models/user');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authService = {

    /**
     * Log users in
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
            throw error;
        }

        const token = jwt.sign(
            { user: { id: user._id, email: user.email, role: user.role } },
            process.env.SECRET_KEY,
            { expiresIn: '1d' }
        );

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

        return { 
            id: newUser._id, 
            name: newUser.name, 
            email: newUser.email 
        };
    },

};

module.exports = authService;