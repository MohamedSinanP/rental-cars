"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    userName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        default: "user",
    },
    profilePic: {
        type: String,
        required: false
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: false,
        },
        coordinates: {
            type: [Number],
            required: false,
        },
        address: { type: String, required: false },
    },
    googleId: {
        type: String,
        required: false
    },
    otp: {
        type: String,
        default: null,
    },
    otpExpiresAt: {
        type: Date,
        default: null,
    },
    otpLastSentAt: {
        type: Date,
        default: null,
    },
    refreshToken: {
        type: String,
        default: null,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    resetToken: {
        type: String,
        default: null,
    },
    resetTokenExpiresAt: {
        type: Date,
        default: null,
    }
}, {
    timestamps: true,
});
userSchema.index({ location: "2dsphere" });
exports.User = (0, mongoose_1.model)("User", userSchema);
