const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    components:{
        type: [String],
        required: true,
    },
    status:{
        type: String,
        default: 'PENDING',
        enum: ['PENDING', 'COMPLETED', 'CANCELLED']
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    managerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    customDeliveryTime:{
        type: Date,
        required: false,
    }
})


const Order = mongoose.model('Order', orderSchema);
module.exports = Order;