"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_js_1 = __importDefault(require("../config/stripe.js"));
const http_error_js_1 = require("../utils/http.error.js");
const types_js_1 = require("../types/types.js");
class PaymentService {
    constructor() { }
    ;
    async createPaymentIntentService(amount) {
        if (!amount) {
            throw new http_error_js_1.HttpError(types_js_1.StatusCode.BAD_REQUEST, 'Amount is required');
        }
        const paymentIntent = await stripe_js_1.default.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'inr',
            payment_method_types: ['card'],
        });
        return {
            clientSecret: paymentIntent.client_secret,
            paymentId: paymentIntent.id,
        };
    }
}
exports.default = PaymentService;
//# sourceMappingURL=payment.service.js.map