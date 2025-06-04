"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSubscription = void 0;
const mongoose_1 = require("mongoose");
const userSubscriptionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subscription', required: true },
    stripeSubscriptionId: { type: String, required: false },
    status: { type: String, required: true },
    currentPeriodStart: { type: Date, required: false },
    currentPeriodEnd: { type: Date, required: false },
}, { timestamps: true });
exports.UserSubscription = (0, mongoose_1.model)("UserSubscription", userSubscriptionSchema);
