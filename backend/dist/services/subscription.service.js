"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const types_js_1 = __importDefault(require("../di/types.js"));
const http_error_js_1 = require("../utils/http.error.js");
const types_js_2 = require("../types/types.js");
const stripe_js_1 = __importDefault(require("../config/stripe.js"));
let SubscriptionService = class SubscriptionService {
    _subscriptionRepository;
    _userSubsRepository;
    _userRepository;
    constructor(_subscriptionRepository, _userSubsRepository, _userRepository) {
        this._subscriptionRepository = _subscriptionRepository;
        this._userSubsRepository = _userSubsRepository;
        this._userRepository = _userRepository;
    }
    ;
    async createSubscription(data) {
        const subscription = await this._subscriptionRepository.addSubscription(data);
        if (!subscription) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Can't add new subscription");
        }
        ;
        return subscription;
    }
    ;
    async getSubscriptions() {
        const subscriptions = await this._subscriptionRepository.findAll();
        if (!subscriptions) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Can't find subscriptions");
        }
        return subscriptions;
    }
    ;
    async editSubscription(subId, data) {
        const updatedSubscription = await this._subscriptionRepository.update(subId, data);
        if (!updatedSubscription) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Can't update the subscription");
        }
        return updatedSubscription;
    }
    ;
    async getActiveSubscriptions() {
        const activeSubs = await this._subscriptionRepository.findAll({ isActive: true });
        if (!activeSubs) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Can't get subscriptions");
        }
        ;
        return activeSubs;
    }
    ;
    async makeSubscription(req, priceId, subId) {
        const { user } = req;
        const userId = user?.userId;
        const subscription = await this._subscriptionRepository.findOne({ stripePriceId: priceId });
        if (!subscription) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Cant' find the choosed subscription");
        }
        ;
        const session = await stripe_js_1.default.checkout.sessions.create({
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/subscription/cancel`,
            client_reference_id: userId,
            metadata: {
                userId,
                subscriptionId: subId
            }
        });
        if (session.url) {
            const session_url = session.url;
            return session_url;
        }
        else {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.INTERNAL_SERVER_ERROR, "Something went wrong");
        }
        ;
    }
    ;
    async handleWebhook(event) {
        switch (event.type) {
            case 'checkout.session.completed':
                return this.handleCheckoutSessionCompleted(event);
            // case 'invoice.payment_succeeded':
            //   return handleInvoicePaymentSucceeded(event);
            // case 'invoice.payment_failed':
            //   return handleInvoicePaymentFailed(event);
            // case 'customer.subscription.updated':
            //   return handleCustomerSubscriptionUpdated(event);
            // case 'customer.subscription.deleted':
            //   return handleCustomerSubscriptionDeleted(event);
            default:
                throw new http_error_js_1.HttpError(types_js_2.StatusCode.INTERNAL_SERVER_ERROR, `Unhandled event type: ${event.type}`);
        }
        ;
    }
    ;
    async handleCheckoutSessionCompleted(event) {
        const session = event.data.object;
        const { userId, subscriptionId } = session.metadata;
        if (session.subscription) {
            const stripeSubscription = await stripe_js_1.default.subscriptions.retrieve(session.subscription, { expand: ['latest_invoice', 'customer'] });
            await this._userSubsRepository.createSub({
                userId,
                subscriptionId,
                stripeSubscriptionId: stripeSubscription.id,
                status: stripeSubscription.status,
                currentPeriodStart: new Date((stripeSubscription.current_period_start ?? Date.now() / 1000) * 1000),
                currentPeriodEnd: new Date((stripeSubscription.current_period_end ?? Date.now() / 1000) * 1000),
                cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
            });
            await this._userRepository.update(userId, {
                subscriptionId
            });
        }
        ;
    }
    ;
    async getUserSubscription(req) {
        const { user } = req;
        const userId = user?.userId;
        const userSub = await this._userSubsRepository.findUserSubscription(userId);
        if (!userSub) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Can't find your subscription");
        }
        return userSub;
    }
    ;
};
SubscriptionService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_js_1.default.ISubscriptionRepository)),
    __param(1, (0, inversify_1.inject)(types_js_1.default.IUserSubsRepository)),
    __param(2, (0, inversify_1.inject)(types_js_1.default.IUserRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], SubscriptionService);
exports.default = SubscriptionService;
;
//# sourceMappingURL=subscription.service.js.map