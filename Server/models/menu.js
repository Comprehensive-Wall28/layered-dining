const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish'],
        default: 'Main Course'
    },
    image: {
        type: String,
        default: null
    },
    ingredients: [{
        type: String,
        trim: true
    }],
    isAvailable: {
        type: Boolean,
        default: true
    },
    preparationTime: {
        type: Number,
        required: false
    },
    tags: [{
        type: String,
        trim: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
menuItemSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
module.exports = MenuItem;