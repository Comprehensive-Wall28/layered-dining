const mongoose = require('mongoose');
// Ensure Cart model is registered before Order (so refs resolve)
require('./cart');

const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    customerName: {
        type: String,
        required: true,
    },
    orderType: {
        type : String,
         enum: ['Dine-In', 'Takeaway', 'Delivery'],
        required: true,
        default: 'Dine-In'
    },
    status: {
        type: String,
        enum: ['Accepted','Pending','In Progress', 'Completed', 'Cancelled'],
        required: true,
        default: 'In Progress'
    },
    totalPrice: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Unpaid', 'Refunded'],
        required: true,
        default: 'Unpaid'
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    customerNotes: {
        type: String,
        required: false
    }
});

mongoose.model('Order', orderSchema);
module.exports = mongoose.model('Order', orderSchema);