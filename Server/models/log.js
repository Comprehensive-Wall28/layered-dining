const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    action: {
        type: String,
        enum: ['CREATE', 'LOG_IN', 'LOG_OUT', 'UPDATE', 'DELETE'],
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    affectedDocument: { //The object affected by action
        type: mongoose.Schema.Types.ObjectId,
        required: false,
    },
    affectedModel: { 
        type: String,
        enum: ['User', 'Order', 'Post', 'Menu'], //Update based on models aded later!
        required: false,
    },
    severity: { //Severity
        type: String,
        enum: ['NOTICE', 'IMPORTANT', 'WARNING'],
        required: true,
    },
    type: {
        type: String,
        enum: ['SUCCESS','FAILURE','SECURITY','ACTIVITY','ADMINISTRATIVE'],
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    performedAt: {
        type: Date,
        default: Date.now,
    },
})


const Log = mongoose.model('Log', userSchema);
module.exports = Log;