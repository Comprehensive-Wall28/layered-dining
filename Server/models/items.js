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
        required: false,},
        caloriesPerUnit: {
        type: Number,
        required: false,}
    ,lOWarningThreshold: {
        type: Number,
        required: false}});

const Supply = mongoose.model('Supply', supplySchema);
module.exports = Supply;