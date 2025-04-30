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
const base_repository_js_1 = require("./base.repository.js");
const types_js_1 = __importDefault(require("../di/types.js"));
const mongoose_1 = require("mongoose");
let SubscriptionRepository = class SubscriptionRepository extends base_repository_js_1.BaseRepository {
    subscriptionModel;
    constructor(subscriptionModel) {
        super(subscriptionModel);
        this.subscriptionModel = subscriptionModel;
    }
    ;
    async addSubscription(data) {
        return await this.subscriptionModel.create(data);
    }
    ;
};
SubscriptionRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_js_1.default.SubscriptionModel)),
    __metadata("design:paramtypes", [mongoose_1.Model])
], SubscriptionRepository);
exports.default = SubscriptionRepository;
;
//# sourceMappingURL=subscription.repository.js.map