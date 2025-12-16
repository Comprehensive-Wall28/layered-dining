const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        index: true
    },
    items: {
        type: [
            {
                menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
                quantity: { type: Number, required: true, min: 1 }
            }
        ],
        default: []
    },
    totalPrice: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
