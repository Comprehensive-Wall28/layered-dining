const mongoose = require('mongoose');
const supplySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,},
    quantity: {
        type: Number,
        required: true,},
    unit: {
        type: String,
        enum: ['kg', 'liters', 'pieces', 'packs', 'boxes'],
        required: false,},
    supplier: {
        type: String,
        required: false,},
    expirationDate: {
          type: Date,
        required: false,}
    ,
    status: {
        type: String,
        enum: ['Safe to Consume', 'Expired', 'Expires soon'],
        default: 'Safe to Consume',}
});

const Supply = mongoose.model('Supply', supplySchema);
module.exports = Supply;