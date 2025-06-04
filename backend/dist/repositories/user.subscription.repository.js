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
const base_repository_1 = require("./base.repository");
const types_1 = __importDefault(require("../di/types"));
const mongoose_1 = require("mongoose");
let UserSubsRepository = class UserSubsRepository extends base_repository_1.BaseRepository {
    constructor(_userSubsModel) {
        super(_userSubsModel);
        this._userSubsModel = _userSubsModel;
    }
    ;
    createSub(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._userSubsModel.create(data);
        });
    }
    ;
    getUserActiveSubscription(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._userSubsModel.findOne({
                userId,
                status: 'active',
            })
                .sort({ currentPeriodEnd: -1 })
                .populate('subscriptionId')
                .populate('userId')
                .lean();
        });
    }
    ;
    findUsersSubscriptions(page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const searchQuery = search
                ? {
                    $or: [
                        { status: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                    ]
                }
                : {};
            const data = yield this._userSubsModel.find(searchQuery).skip(skip).limit(limit)
                .populate('subscriptionId')
                .populate('userId');
            const total = yield this._userSubsModel.countDocuments();
            return { data, total };
        });
    }
    ;
    findLatestActiveByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._userSubsModel.findOne({
                userId,
                status: 'active',
                cancelAtPeriodEnd: false,
            }).sort({ currentPeriodEnd: -1 });
        });
    }
    ;
    getTotalSubscriptionEarnings() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield this._userSubsModel.aggregate([
                {
                    $match: {
                        status: { $in: ["active", "cancelled", "completed"] }
                    }
                },
                {
                    $lookup: {
                        from: "subscriptions",
                        localField: "subscriptionId",
                        foreignField: "_id",
                        as: "subscriptionData"
                    }
                },
                {
                    $unwind: "$subscriptionData"
                },
                {
                    $group: {
                        _id: null,
                        totalEarnings: { $sum: "$subscriptionData.price" }
                    }
                }
            ]);
            return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.totalEarnings) || 0;
        });
    }
    ;
    getTotalEarnings(type, year, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const matchConditions = {
                status: { $in: ['active', 'cancelled', 'completed'] }
            };
            if (type === 'yearly') {
                const start = new Date(`${year}-01-01`);
                const end = new Date(`${year}-12-31`);
                matchConditions.currentPeriodStart = { $gte: start, $lte: end };
            }
            if (type === 'monthly') {
                const start = new Date(`${year}-${from}-01`);
                const end = new Date(`${year}-${from}-31`); // rough end of month
                matchConditions.currentPeriodStart = { $gte: start, $lte: end };
            }
            if (type === 'custom') {
                const start = new Date(from);
                const end = new Date(to);
                matchConditions.currentPeriodStart = { $gte: start, $lte: end };
            }
            const result = yield this._userSubsModel.aggregate([
                { $match: matchConditions },
                {
                    $lookup: {
                        from: 'subscriptions',
                        localField: 'subscriptionId',
                        foreignField: '_id',
                        as: 'subscription'
                    }
                },
                { $unwind: '$subscription' },
                {
                    $group: {
                        _id: null,
                        totalEarnings: { $sum: '$subscription.price' }
                    }
                }
            ]);
            return result.length > 0 ? result[0].totalEarnings : 0;
        });
    }
    ;
    getUserSubs(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const data = yield this._userSubsModel
                .find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('subscriptionId');
            const total = yield this._userSubsModel.countDocuments({ userId });
            return { data, total };
        });
    }
    ;
    markExpiredAsCompleted() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const result = yield this._userSubsModel.updateMany({
                status: 'active',
                currentPeriodEnd: { $lt: now }
            }, {
                $set: { status: 'completed' }
            });
            return { modifiedCount: result.modifiedCount };
        });
    }
    insertOne(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._userSubsModel.create(data);
        });
    }
    ;
    deleteManyStalePending() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._userSubsModel.deleteMany({
                status: 'pending',
                createdAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) },
            });
            return { deletedCount: result.deletedCount };
        });
    }
};
UserSubsRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.UserSubsModel)),
    __metadata("design:paramtypes", [mongoose_1.Model])
], UserSubsRepository);
exports.default = UserSubsRepository;
;
