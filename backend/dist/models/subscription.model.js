"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const mongoose_1 = require("mongoose");
const subscriptionSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String },
    features: { type: [String], required: true },
    stripeProductId: { type: String, required: true },
    stripePriceId: { type: String, required: true },
    price: { type: Number, required: true },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.Subscription = (0, mongoose_1.model)("Subscription", subscriptionSchema);
//# sourceMappingURL=subscription.model.js.map