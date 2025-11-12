const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: true,
    },
    partySize: {
        type: Number,
        required: true,
        min: 1,
    },
    reservationDate: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String, // Format: "HH:MM" (e.g., "18:00")
        required: true,
    },
    endTime: {
        type: String, // Format: "HH:MM" (e.g., "20:00")
        required: true,
    },
    duration: {
        type: Number, // Duration in hours
        default: 2,
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'No-Show'],
        default: 'Pending',
    },
    customerName: {
        type: String,
        required: true,
    },
    customerEmail: {
        type: String,
        required: true,
    },
    customerPhone: {
        type: String,
        required: false,
    },
    specialRequests: {
        type: String,
        maxlength: 500,
        default: '',
    },
    occasion: {
        type: String,
        enum: ['Birthday', 'Anniversary', 'Business', 'Date', 'Family Gathering', 'Other', 'None'],
        default: 'None',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

// Index for efficient queries on date and table
reservationSchema.index({ reservationDate: 1, tableId: 1 });
reservationSchema.index({ userId: 1, status: 1 });

// Update the updatedAt timestamp before saving
reservationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual field to check if reservation is in the past
reservationSchema.virtual('isPast').get(function() {
    const reservationDateTime = new Date(this.reservationDate);
    const [hours, minutes] = this.endTime.split(':');
    reservationDateTime.setHours(parseInt(hours), parseInt(minutes));
    return reservationDateTime < new Date();
});

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
