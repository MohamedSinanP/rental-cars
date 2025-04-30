"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSubscription = void 0;
const mongoose_1 = require("mongoose");
const userSubscriptionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subscription', required: true },
    stripeSubscriptionId: { type: String, required: true },
    status: { type: String, required: true },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
}, { timestamps: true });
exports.UserSubscription = (0, mongoose_1.model)("UserSubscription", userSubscriptionSchema);
//# sourceMappingURL=user.subscription.model.js.map