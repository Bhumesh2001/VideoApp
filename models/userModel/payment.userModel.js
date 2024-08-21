const mongoose = require('mongoose');

const userPaymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true,
        unique: true
    },
    paymentDate: {
        type: Date,
        default: Date.now,
    },
    subscriptionType: {
        type: String,
        enum: ['one-time', 'subscription'],
        default: 'subscription'
    },
    plan: {
        type: String,
        enum: ['monthly', 'quarterly', 'yearly'],
        required: function () { return this.subscriptionType === 'subscription'; }
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    expiryDate: {
        type: Date,
        required: function () { return this.subscriptionType === 'subscription'; },
        default: function () {
            if (this.plan === 'monthly') {
                return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from paymentDate
            } else if (this.plan === 'quarterly') {
                return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from paymentDate
            } else if (this.plan === 'yearly') {
                return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365 days from paymentDate
            }
        }
    },
});

userPaymentSchema.index({ userId: 1, category: 1 });

const userPaymentModel = mongoose.model('UserPayment', userPaymentSchema);

module.exports = userPaymentModel;