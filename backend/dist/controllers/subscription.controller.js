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
const types_js_2 = require("../types/types.js");
const http_response_js_1 = require("../utils/http.response.js");
const stripe_1 = __importDefault(require("stripe"));
let SubscriptionController = class SubscriptionController {
    _subscriptionService;
    constructor(_subscriptionService) {
        this._subscriptionService = _subscriptionService;
    }
    ;
    async createSubscription(req, res, next) {
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
            const newSubscription = await this._subscriptionService.createSubscription(subscriptionData);
            res.status(types_js_2.StatusCode.CREATED).json(http_response_js_1.HttpResponse.created(newSubscription, "Subscriptoin created."));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async getSubscriptions(req, res, next) {
        try {
            const subscriptions = await this._subscriptionService.getSubscriptions();
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(subscriptions));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async editSubscription(req, res, next) {
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
            console.log(req.body, "this is rqboy");
            const subscriptions = await this._subscriptionService.editSubscription(subId, subEditData);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(subscriptions, "Subscription updated."));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async getActiveSubscriptions(req, res, next) {
        try {
            const activeSubs = await this._subscriptionService.getActiveSubscriptions();
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(activeSubs));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async makeSubscription(req, res, next) {
        try {
            const { priceId, subId } = req.body;
            const session_url = await this._subscriptionService.makeSubscription(req, priceId, subId);
            res.status(types_js_2.StatusCode.OK).json({ url: session_url });
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async handleWebhook(req, res, next) {
        console.log("i am also working >>>>>");
        const sig = req.headers['stripe-signature'];
        let event;
        try {
            event = stripe_1.default.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET_KEY);
            await this._subscriptionService.handleWebhook(event);
            res.json({ received: true });
        }
        catch (err) {
            console.error(`Webhook Error: ${err.message}`);
            res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }
    ;
    async getUserSubscription(req, res, next) {
        try {
            const userSub = await this._subscriptionService.getUserSubscription(req);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(userSub));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
};
SubscriptionController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_js_1.default.ISubscriptionService)),
    __metadata("design:paramtypes", [Object])
], SubscriptionController);
exports.default = SubscriptionController;
;
//# sourceMappingURL=subscription.controller.js.map