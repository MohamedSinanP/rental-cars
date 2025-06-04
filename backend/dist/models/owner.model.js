"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Owner = void 0;
const mongoose_1 = require("mongoose");
const ownerSchema = new mongoose_1.Schema({
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
        required: true,
    },
    role: {
        type: String,
        default: "user",
    },
    commission: {
        type: Number,
        required: true,
    },
    otp: {
        type: String,
        default: null,
    },
    otpExpiresAt: {
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
    },
}, {
    timestamps: true,
});
exports.Owner = (0, mongoose_1.model)("Owner", ownerSchema);
