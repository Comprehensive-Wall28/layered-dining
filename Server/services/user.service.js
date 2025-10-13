const UserModel = require('../models/user');
const LogModel = require('../models/log');

const customerService = {

     /**
     * Delete user account
     * @param {ID} id - The user's ID.
     * @returns {string} The deleted user's details
     * @throws {Error} If user not found
     */
    async deleteAccount(id) {

        const deletedUser = await UserModel.findByIdAndDelete(id)

        if(!deletedUser){
            const error = new Error('User not found');
            error.code = 404;
            throw error;
        }
        const log = new LogModel({
            action: 'DELETE',
            description: 'User deleted successfully',
            severity: 'NOTICE',
            type: 'SUCCESS',
            userId: deletedUser._id,
        });
        await log.save();
        return{
            id: deletedUser._id,
            name: deletedUser.name,
            email: deletedUser.email,
            message: 'User deleted successfully'
        }
    },
     /**
     * Get user account
     * @param {ID} id - The user's ID.
     * @returns {string} The user's details
     * @throws {Error} If user not found or ID not provided
     */
    //TODO: ADD PROTECTION ON WHO GETS THE DETAILS
    async getCurrentUser(id) {

        if (!id) {
            const error = new Error('No ID provided');
            error.code = 400;
            throw error;
        }
        const user = await UserModel.findById(id);

        if (!user) {
            const error = new Error('User not found');
            error.code = 404;
            throw error;
        }
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    },
     /**
     * Update user account details, not all parameters are required, only one is.
     * @param {ID} id - The user's ID.
     * @param {NAME} name - The user's new name
     * @param {EMAIL} email - The user's new Email
     * @param {PASSWORD} password - The user's new Password
     * @returns {string} Confirmation
     * @throws {Error} If user not found or parameters not provided
     */
    async updateUserProfile(id, name, email, password) {
        //get the user
        const user = await UserModel.findById(id);
        modifiedParameters = [];

        if(!user){
            const error = new Error('User not found');
            error.code = 404;
            throw error;
        }
        if(name){
            user.name = name;
            modifiedParameters.push('NAME');
        }
        if(email){
            user.email = email;
            modifiedParameters.push('EMAIL');
        }
        if(password){
            user.password = password;
            modifiedParameters.push('PASSWORD');
        }
        await user.save(); //Save the user

        if(modifiedParameters.length > 0){
            const log = new LogModel({
                action: 'UPDATE',
                description: 'User updated: ' + modifiedParameters,
                severity: 'NOTICE',
                type: 'SUCCESS',
                userId: user._id,
            });
            await log.save();
        }

        return {
            modifiedParameters: modifiedParameters,
            message: 'User updated successfully!'
        }
    }

};

module.exports = customerService;