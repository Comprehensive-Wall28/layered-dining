const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: false,
    },
    category:{
        type: String,
        required: false,
    },
    availableQuantity:{
        type: Number,
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
})

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;