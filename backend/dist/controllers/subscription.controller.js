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
const types_2 = require("../types/types");
const http_response_1 = require("../utils/http.response");
const stripe_1 = __importDefault(require("stripe"));
let SubscriptionController = class SubscriptionController {
    constructor(_subscriptionService) {
        this._subscriptionService = _subscriptionService;
    }
    ;
    createSubscription(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parsedFeatures = JSON.parse(req.body.features);
                const subscriptionData = {
                    name: req.body.name,
                    description: req.body.description,
                    features: parsedFeatures,
                    stripeProductId: req.body.stripeProductId,
                    stripePriceId: req.body.stripePriceId,
                    price: req.body.price,
                    billingCycle: req.body.billingCycle,
                    isActive: true
                };
                const newSubscription = yield this._subscriptionService.createSubscription(subscriptionData);
                res.status(types_2.StatusCode.CREATED).json(http_response_1.HttpResponse.created(newSubscription, "Subscriptoin created."));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    getSubscriptions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subscriptions = yield this._subscriptionService.getSubscriptions();
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(subscriptions));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    editSubscription(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subId = req.params.id;
                const parsedFeatures = JSON.parse(req.body.features);
                const subEditData = {
                    name: req.body.name,
                    description: req.body.description,
                    features: parsedFeatures,
                    price: req.body.price,
                    billingCycle: req.body.billingCycle,
                    stripeProductId: req.body.stripeProductId,
                    stripePriceId: req.body.stripePriceId,
                    isActive: req.body.isActive
                };
                const subscriptions = yield this._subscriptionService.editSubscription(subId, subEditData);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(subscriptions, "Subscription updated."));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    getActiveSubscriptions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const activeSubs = yield this._subscriptionService.getActiveSubscriptions();
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(activeSubs));
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
    makeSubscription(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { priceId, subId } = req.body;
                const session_url = yield this._subscriptionService.makeSubscription(req, priceId, subId);
                res.status(types_2.StatusCode.OK).json({ url: session_url });
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
    handleWebhook(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const sig = req.headers['stripe-signature'];
            let event;
            try {
                event = stripe_1.default.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET_KEY);
                yield this._subscriptionService.handleWebhook(event);
                res.json({ received: true });
            }
            catch (err) {
                console.error(`Webhook Error: ${err.message}`);
                res.status(400).send(`Webhook Error: ${err.message}`);
            }
        });
    }
    ;
    getUserSubscription(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userSub = yield this._subscriptionService.getUserSubscription(req);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(userSub));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    getUsersSubscriptions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 6;
                const search = req.query.search || '';
                const usersSubs = yield this._subscriptionService.getUsersSubscriptions(page, limit, search);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(usersSubs));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    changeUserSubscriptionStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subId = req.params.id;
                const { status } = req.body;
                const updatedUserSub = yield this._subscriptionService.updateUserSubStatus(subId, status);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(updatedUserSub));
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
    getUserAllSubscriptions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const userId = user === null || user === void 0 ? void 0 : user.userId;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 6;
                const userSubs = yield this._subscriptionService.getUserAllSubscriptions(userId, page, limit);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(userSubs));
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
    cancelUserSub(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id: subscriptionId } = req.params;
                if (!subscriptionId) {
                    res.status(types_2.StatusCode.BAD_REQUEST).json(http_response_1.HttpResponse.error('Subscription ID is required'));
                    return;
                }
                const result = yield this._subscriptionService.cancelUserSub(subscriptionId);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(result, 'Subscription cancelled successfully'));
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
    getUserActiveSub(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const userId = user === null || user === void 0 ? void 0 : user.userId;
                const activeUserSub = yield this._subscriptionService.getUserActiveSub(userId);
                if (!activeUserSub) {
                    res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success({}));
                    return;
                }
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(activeUserSub));
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
};
SubscriptionController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.ISubscriptionService)),
    __metadata("design:paramtypes", [Object])
], SubscriptionController);
exports.default = SubscriptionController;
;
