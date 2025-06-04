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
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../di/types"));
const http_error_1 = require("../utils/http.error");
const types_2 = require("../types/types");
const stripe_1 = __importDefault(require("../config/stripe"));
const mongoose_1 = require("mongoose");
const helperFunctions_1 = require("../utils/helperFunctions");
let SubscriptionService = class SubscriptionService {
    constructor(_subscriptionRepository, _userSubsRepository, _userSubscriptionRepository) {
        this._subscriptionRepository = _subscriptionRepository;
        this._userSubsRepository = _userSubsRepository;
        this._userSubscriptionRepository = _userSubscriptionRepository;
    }
    ;
    createSubscription(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscription = yield this._subscriptionRepository.addSubscription(data);
            if (!subscription) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't add new subscription");
            }
            ;
            return (0, helperFunctions_1.toSubscriptionDTO)(subscription);
        });
    }
    ;
    getSubscriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptions = yield this._subscriptionRepository.findAll();
            if (!subscriptions) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't find subscriptions");
            }
            return subscriptions.map(helperFunctions_1.toSubscriptionDTO);
        });
    }
    ;
    editSubscription(subId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedSubscription = yield this._subscriptionRepository.update(subId, data);
            if (!updatedSubscription) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't update the subscription");
            }
            return (0, helperFunctions_1.toSubscriptionDTO)(updatedSubscription);
        });
    }
    ;
    getActiveSubscriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            const activeSubs = yield this._subscriptionRepository.findAll({ isActive: true });
            if (!activeSubs) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't get subscriptions");
            }
            ;
            return activeSubs.map(helperFunctions_1.toSubscriptionDTO);
        });
    }
    ;
    makeSubscription(req, priceId, subId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user } = req;
            const userId = user === null || user === void 0 ? void 0 : user.userId;
            const userObjId = new mongoose_1.Types.ObjectId(user === null || user === void 0 ? void 0 : user.userId);
            const subObjId = new mongoose_1.Types.ObjectId(subId);
            const existingSub = yield this._userSubscriptionRepository.findOne({
                userId: userObjId,
                status: { $in: ['active', 'pending'] }
            });
            if (existingSub) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, 'You already have a pending or active subscription');
            }
            const subscription = yield this._subscriptionRepository.findOne({ stripePriceId: priceId });
            if (!subscription) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't find the chosen subscription");
            }
            // Insert a pending lock before Stripe checkout session is created
            yield this._userSubscriptionRepository.insertOne({
                userId: userObjId,
                subscriptionId: subObjId,
                status: 'pending',
                createdAt: new Date()
            });
            const session = yield stripe_1.default.checkout.sessions.create({
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CLIENT_URL}/subscription`,
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
                throw new http_error_1.HttpError(types_2.StatusCode.INTERNAL_SERVER_ERROR, "Something went wrong");
            }
            ;
        });
    }
    ;
    handleWebhook(event) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (event.type) {
                case 'checkout.session.completed':
                    return this.handleCheckoutSessionCompleted(event);
                default:
                    throw new http_error_1.HttpError(types_2.StatusCode.INTERNAL_SERVER_ERROR, `Unhandled event type: ${event.type}`);
            }
            ;
        });
    }
    ;
    handleCheckoutSessionCompleted(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = event.data.object;
            const { userId, subscriptionId } = session.metadata;
            if (session.subscription) {
                const stripeSubscription = yield stripe_1.default.subscriptions.retrieve(session.subscription, {
                    expand: ['items.data.price.product']
                });
                const firstItem = stripeSubscription.items.data[0];
                const currentPeriodStartUnix = firstItem.current_period_start;
                const currentPeriodEndUnix = firstItem.current_period_end;
                yield this._userSubsRepository.createSub({
                    userId,
                    subscriptionId,
                    stripeSubscriptionId: stripeSubscription.id,
                    status: stripeSubscription.status,
                    currentPeriodStart: new Date(currentPeriodStartUnix * 1000),
                    currentPeriodEnd: new Date(currentPeriodEndUnix * 1000)
                });
            }
            ;
        });
    }
    ;
    getUserSubscription(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user } = req;
            const userId = user === null || user === void 0 ? void 0 : user.userId;
            let userSub;
            userSub = yield this._userSubsRepository.getUserActiveSubscription(userId);
            if (!userSub) {
                return null;
            }
            return (0, helperFunctions_1.toUserSubscriptionDTO)(userSub);
        });
    }
    ;
    getUsersSubscriptions(page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, total } = yield this._userSubsRepository.findUsersSubscriptions(page, limit, search);
            if (!data) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't find your subscription");
            }
            ;
            const totalPages = Math.ceil(total / limit);
            return {
                data: data.map(helperFunctions_1.toUserSubscriptionDTO),
                totalPages,
                currentPage: page,
            };
        });
    }
    ;
    updateUserSubStatus(subId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            if (status === 'cancelled') {
                return yield this.cancelUserSub(subId);
            }
            const updatedUseSub = yield this._userSubsRepository.update(subId, { status: status });
            if (!updatedUseSub) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't update user subscription status");
            }
            return (0, helperFunctions_1.toUserSubscriptionDTO)(updatedUseSub);
        });
    }
    ;
    getUserAllSubscriptions(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, total } = yield this._userSubsRepository.getUserSubs(userId, page, limit);
            if (!total) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't find your subscriptions");
            }
            const totalPages = Math.ceil(total / limit);
            return {
                data: data.map(helperFunctions_1.toUserSubscriptionDTO),
                totalPages,
                currentPage: page,
            };
        });
    }
    cancelUserSub(subId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingSub = yield this._userSubsRepository.findById(subId);
            if (!existingSub) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Subscription not found");
            }
            yield stripe_1.default.subscriptions.cancel(existingSub.stripeSubscriptionId);
            const cancelledSub = yield this._userSubsRepository.update(subId, {
                status: 'cancelled'
            });
            if (!cancelledSub) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't cancel your subscriptoin.");
            }
            return (0, helperFunctions_1.toUserSubscriptionDTO)(cancelledSub);
        });
    }
    ;
    getUserActiveSub(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeSub = yield this._userSubsRepository.getUserActiveSubscription(userId);
            if (!activeSub) {
                return null;
            }
            return (0, helperFunctions_1.toUserSubscriptionDTO)(activeSub);
        });
    }
    ;
    markExpiredSubscriptionsAsCompleted() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._userSubsRepository.markExpiredAsCompleted();
            return result.modifiedCount;
        });
    }
    ;
    deleteStalePendingSubscriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._userSubsRepository.deleteManyStalePending();
            return result.deletedCount;
        });
    }
};
SubscriptionService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.ISubscriptionRepository)),
    __param(1, (0, inversify_1.inject)(types_1.default.IUserSubsRepository)),
    __param(2, (0, inversify_1.inject)(types_1.default.IUserSubsRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], SubscriptionService);
exports.default = SubscriptionService;
;
