"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("../config/stripe"));
const http_error_1 = require("../utils/http.error");
const types_1 = require("../types/types");
class PaymentService {
    constructor() { }
    ;
    createPaymentIntentService(amount) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!amount) {
                throw new http_error_1.HttpError(types_1.StatusCode.BAD_REQUEST, 'Amount is required');
            }
            const paymentIntent = yield stripe_1.default.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: 'inr',
                payment_method_types: ['card'],
            });
            return {
                clientSecret: paymentIntent.client_secret,
                paymentId: paymentIntent.id,
            };
        });
    }
}
exports.default = PaymentService;
