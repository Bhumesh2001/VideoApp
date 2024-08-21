const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    email: {
        type: String,
        ref: 'User',
        required: true, 
        unique: true
    },
    token: {
        type: String, 
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now, 
        expires: '6h',
    },
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;