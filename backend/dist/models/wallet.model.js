"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const mongoose_1 = require("mongoose");
const transactionSchema = new mongoose_1.Schema({
    paymentType: {
        type: String,
        required: true,
    },
    transactionAmount: {
        type: Number,
        required: true,
    },
    transactionId: {
        type: String,
        required: false,
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });
const walletSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    balance: {
        type: Number,
        required: true,
    },
    transactions: {
        type: [transactionSchema],
        default: [],
    },
}, {
    timestamps: true,
});
exports.Wallet = (0, mongoose_1.model)('Wallet', walletSchema);
