const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
    },
    mobileNumber: {
        type: String,
        required: [true, 'Mobile number is required'],
        unique: true,
        validate: {
            validator: function (v) {
                return /^\d{10}$/.test(v);
            },
            message: props =>
                `${props.value} is not a valid mobile number! Mobile number should be 10 digits.`,
        }
    },
    role: {
        type: String,
        enum: ['user'],
        default: 'user',
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    verificationCode: { 
        type: String 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    profilePicture: {
        type: String,
        default: '',
    },
});

userSchema.index({ email: 1 });

// Middleware to hash the password before saving the user
userSchema.pre('save', async function (next) {
    const user = this;

    // Update the updatedAt field to the current date
    user.updatedAt = new Date();

    // Only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare entered password with the hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to update profile picture
userSchema.methods.updateProfilePicture = async function (url) {
    this.profilePicture = url;
    await this.save();
};

// Method to deactivate user
userSchema.methods.deactivate = async function () {
    this.isActive = false;
    await this.save();
};

// Method to activate user
userSchema.methods.activate = async function () {
    this.isActive = true;
    await this.save();
};

// Create the User model from the schema
const userModel = mongoose.model('User', userSchema);

module.exports = userModel;