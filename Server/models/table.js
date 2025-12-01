const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
    },
    location: {
        type: String,
        enum: ['Indoor', 'Outdoor', 'Patio', 'Private Room', 'Bar Area'],
        default: 'Indoor',
    },
    status: {
        type: String,
        enum: ['Available', 'Occupied', 'Maintenance'],
        default: 'Available',
    },
    features: [{
        type: String,
        enum: ['Window View', 'Wheelchair Accessible', 'Quiet Area', 'Near Kitchen', 'Near Entrance'],
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the updatedAt timestamp before saving
tableSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Table = mongoose.model('Table', tableSchema);
module.exports = Table;
