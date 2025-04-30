"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bookingSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    carId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Car',
        required: true,
    },
    ownerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Owner',
        required: true,
    },
    userDetails: {
        address: { type: String, required: true },
        email: { type: String, required: true },
        name: { type: String, required: true },
        phoneNumber: { type: String, required: true },
    },
    carLocation: {
        address: String,
        latitude: Number,
        longitude: String,
    },
    pickupLocation: { type: String, required: true },
    dropoffLocation: { type: String, required: true },
    pickupDateTime: { type: Date, required: true },
    dropoffDateTime: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['wallet', 'stripe'],
        required: true,
    },
    paymentId: { type: String, required: false },
    isPremiumBooking: {
        type: Boolean,
        required: false
    },
    discountAmount: {
        type: Number,
        required: false
    },
    discountPercentage: {
        type: Number,
        required: false
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'completed'],
    },
}, { timestamps: true });
const Booking = (0, mongoose_1.model)('Booking', bookingSchema);
exports.default = Booking;
//# sourceMappingURL=booking.model.js.map