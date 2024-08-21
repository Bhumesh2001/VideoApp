const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    prices: {
        monthly: {
            type: Number,
            required: true,
            min: 0,  // Price should be a positive number or zero (if free)
        },
        quarterly: {
            type: Number,
            required: true,
            min: 0,  // Price should be a positive number or zero (if free)
        },
        yearly: {
            type: Number,
            required: true,
            min: 0,  // Price should be a positive number or zero (if free)
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
});

// Middleware to update the updatedAt field on each save
categorySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
