const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },        
    message: { type: String, required: true },      
    read: { type: Boolean, default: false },        
    createdAt: { type: Date, default: Date.now }    
});
 
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    profilePicture:{
        type: String,
        default: null,
    },
    age: {
        type: Number,
        required: false,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['Customer', 'Manager', 'Admin'],
        default: 'Customer',
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        // Make cart optional during initial user creation; it will be attached post-registration
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    notifications: [notificationSchema]
})

const User = mongoose.model('User', userSchema);
module.exports = User;