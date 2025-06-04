"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.BookingRepository = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const base_repository_1 = require("./base.repository");
const types_1 = __importDefault(require("../di/types"));
const inversify_1 = require("inversify");
let BookingRepository = class BookingRepository extends base_repository_1.BaseRepository {
    constructor(_bookingModel) {
        super(_bookingModel);
        this._bookingModel = _bookingModel;
    }
    ;
    bookCar(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._bookingModel.create(data);
        });
    }
    ;
    findOne(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._bookingModel.findOne(query).exec();
        });
    }
    findAllByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._bookingModel.find({ userId })
                .populate('userId')
                .populate('carId');
        });
    }
    ;
    findAllByOwnerId(ownerId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const data = yield this._bookingModel.find({ ownerId })
                .populate('carId')
                .populate('ownerId')
                .populate('userId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            const total = yield this._bookingModel.countDocuments({ ownerId });
            return { data, total };
        });
    }
    ;
    findPaginated(id, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const data = yield this._bookingModel.find({ userId: id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('carId')
                .populate('ownerId')
                .populate('userId');
            const total = yield this._bookingModel.countDocuments({ userId: id });
            return { data, total };
        });
    }
    isBooked(carId, pickupDateTime, dropoffDateTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const carObjId = new mongoose_1.Types.ObjectId(carId);
            const isBooked = yield this._bookingModel.findOne({
                carId: carObjId,
                $or: [
                    {
                        pickupDateTime: { $lte: dropoffDateTime },
                        dropoffDateTime: { $gte: pickupDateTime },
                    },
                    {
                        pickupDateTime: { $gte: pickupDateTime, $lte: dropoffDateTime },
                    },
                ],
            });
            return isBooked;
        });
    }
    ;
    getTotalAdminEarnings() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield this._bookingModel.aggregate([
                {
                    $match: {
                        paymentStatus: "completed"
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$adminCommissionAmount" }
                    }
                }
            ]);
            return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        });
    }
    ;
    getRentalStatsForAdmin(type, year, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const matchCondition = {
                paymentStatus: 'completed',
            };
            let groupBy = {};
            let dateProjection = {};
            if (type === 'monthly') {
                const selectedYear = year || new Date().getFullYear();
                matchCondition.createdAt = {
                    $gte: new Date(`${selectedYear}-01-01T00:00:00Z`),
                    $lte: new Date(`${selectedYear}-12-31T23:59:59Z`)
                };
                groupBy = {
                    _id: { month: { $month: '$createdAt' } },
                    totalCommission: { $sum: '$adminCommissionAmount' },
                    count: { $sum: 1 },
                };
                dateProjection = {
                    $project: {
                        month: '$_id.month',
                        totalCommission: 1,
                        count: 1,
                        _id: 0
                    }
                };
            }
            else if (type === 'yearly') {
                groupBy = {
                    _id: { year: { $year: '$createdAt' } },
                    totalCommission: { $sum: '$adminCommissionAmount' },
                    count: { $sum: 1 },
                };
                dateProjection = {
                    $project: {
                        year: '$_id.year',
                        totalCommission: 1,
                        count: 1,
                        _id: 0
                    }
                };
            }
            else if (type === 'custom') {
                if (!from || !to)
                    throw new Error('From and To dates are required for custom stats');
                matchCondition.createdAt = {
                    $gte: new Date(from),
                    $lte: new Date(to)
                };
                groupBy = {
                    _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } },
                    totalCommission: { $sum: '$adminCommissionAmount' },
                    count: { $sum: 1 },
                };
                dateProjection = {
                    $project: {
                        date: '$_id.date',
                        totalCommission: 1,
                        count: 1,
                        _id: 0
                    }
                };
            }
            const result = yield this._bookingModel.aggregate([
                { $match: matchCondition },
                { $group: groupBy },
                dateProjection
            ]);
            return result;
        });
    }
    ;
    getRentalStatsForOwner(ownerId, type, year, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const matchCondition = {
                paymentStatus: 'completed',
                ownerId: new mongoose_1.default.Types.ObjectId(ownerId)
            };
            let groupBy = {};
            let dateProjection = {};
            if (type === 'monthly') {
                const selectedYear = year || new Date().getFullYear();
                matchCondition.createdAt = {
                    $gte: new Date(`${selectedYear}-01-01T00:00:00Z`),
                    $lte: new Date(`${selectedYear}-12-31T23:59:59Z`)
                };
                groupBy = {
                    _id: { month: { $month: '$createdAt' } },
                    totalEarnings: { $sum: '$ownerEarning' },
                    count: { $sum: 1 },
                };
                dateProjection = {
                    $project: {
                        month: '$_id.month',
                        totalEarnings: 1,
                        count: 1,
                        _id: 0
                    }
                };
            }
            else if (type === 'yearly') {
                groupBy = {
                    _id: { year: { $year: '$createdAt' } },
                    totalEarnings: { $sum: '$ownerEarning' },
                    count: { $sum: 1 },
                };
                dateProjection = {
                    $project: {
                        year: '$_id.year',
                        totalEarnings: 1,
                        count: 1,
                        _id: 0
                    }
                };
            }
            else if (type === 'custom') {
                if (!from || !to)
                    throw new Error('From and To dates are required for custom stats');
                matchCondition.createdAt = {
                    $gte: new Date(from),
                    $lte: new Date(to)
                };
                groupBy = {
                    _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } },
                    totalEarnings: { $sum: '$ownerEarning' },
                    count: { $sum: 1 },
                };
                dateProjection = {
                    $project: {
                        date: '$_id.date',
                        totalEarnings: 1,
                        count: 1,
                        _id: 0
                    }
                };
            }
            const result = yield this._bookingModel.aggregate([
                { $match: matchCondition },
                { $group: groupBy },
                dateProjection
            ]);
            return result;
        });
    }
    getTotalOwnerEarnings() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield this._bookingModel.aggregate([
                {
                    $match: {
                        paymentStatus: "completed"
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$ownerEarning" }
                    }
                }
            ]);
            return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        });
    }
    ;
    bookingCountOfOwnerCars(ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._bookingModel.countDocuments({
                ownerId: ownerId,
                paymentStatus: 'completed'
            });
        });
    }
    ;
    getTotalAdminCommissionForOwner(ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield this._bookingModel.aggregate([
                {
                    $match: {
                        ownerId: new mongoose_1.default.Types.ObjectId(ownerId),
                        paymentStatus: "completed"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalCommission: { $sum: "$adminCommissionAmount" }
                    }
                }
            ]);
            return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.totalCommission) || 0;
        });
    }
    ;
    getPopulatedBooking(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = yield this._bookingModel
                .findById(bookingId)
                .populate('userId')
                .populate('carId')
                .populate('ownerId')
                .lean();
            if (!booking)
                return null;
            return booking;
        });
    }
    ;
    updateExpiredBookings() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const expiredBookings = yield this._bookingModel.find({
                status: 'active',
                dropoffDateTime: { $lt: now },
            });
            yield this._bookingModel.updateMany({ _id: { $in: expiredBookings.map(b => b._id) } }, { $set: { status: 'completed' } });
            return expiredBookings;
        });
    }
    getTotalBookingCount() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._bookingModel.countDocuments();
        });
    }
    ;
    getAllRentalsForAdmin(page, limit, type, year, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const pageNumber = Math.max(1, page);
            const pageSize = Math.max(1, limit);
            const skip = (pageNumber - 1) * pageSize;
            let filter = {};
            if (type === 'yearly') {
                filter.createdAt = {
                    $gte: new Date(year, 0, 1),
                    $lte: new Date(year, 11, 31, 23, 59, 59, 999),
                };
            }
            else if (type === 'monthly') {
                const month = 0; // update based on your input
                filter.createdAt = {
                    $gte: new Date(year, month, 1),
                    $lte: new Date(year, month + 1, 0, 23, 59, 59, 999),
                };
            }
            else if (type === 'custom' && from && to) {
                filter.createdAt = {
                    $gte: new Date(from),
                    $lte: new Date(to),
                };
            }
            else {
                throw new Error('Invalid filter type or missing required date range');
            }
            const data = yield this._bookingModel
                .find(filter)
                .skip(skip)
                .limit(pageSize)
                .sort({ createdAt: -1 })
                .populate('ownerId')
                .populate('carId');
            const total = yield this._bookingModel.countDocuments(filter);
            return { data, total };
        });
    }
    getSalesInformation(type, year, month, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const match = {
                paymentStatus: 'completed'
            };
            if (type === 'yearly' && year) {
                match.createdAt = {
                    $gte: new Date(`${year}-01-01T00:00:00Z`),
                    $lte: new Date(`${year}-12-31T23:59:59Z`)
                };
            }
            if (type === 'monthly' && year && month) {
                const monthStr = String(month).padStart(2, '0');
                const start = new Date(`${year}-${monthStr}-01T00:00:00Z`);
                const end = new Date(new Date(start).setMonth(start.getMonth() + 1));
                match.createdAt = { $gte: start, $lt: end };
            }
            if (type === 'custom' && from && to) {
                match.createdAt = {
                    $gte: new Date(from),
                    $lte: new Date(to)
                };
            }
            const results = yield this._bookingModel.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: null,
                        totalEarnings: { $sum: '$totalPrice' },
                        totalCommissionEarnings: { $sum: '$adminCommissionAmount' },
                        totalOwnerEarnings: { $sum: '$ownerEarning' },
                        totalDiscount: { $sum: { $ifNull: ['$discountAmount', 0] } },
                        totalBookings: { $sum: 1 },
                        premiumBookings: {
                            $sum: {
                                $cond: [{ $eq: ['$isPremiumBooking', true] }, 1, 0]
                            }
                        },
                        refundedBookings: {
                            $sum: {
                                $cond: [{ $eq: ['$paymentStatus', 'refunded'] }, 1, 0]
                            }
                        },
                        averageOrderValue: { $avg: '$totalPrice' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalEarnings: 1,
                        totalCommissionEarnings: 1,
                        totalOwnerEarnings: 1,
                        totalDiscount: 1,
                        totalBookings: 1,
                        premiumBookings: 1,
                        refundedBookings: 1,
                        averageOrderValue: 1
                    }
                }
            ]);
            return Object.assign({}, (results[0] || {
                totalEarnings: 0,
                totalCommissionEarnings: 0,
                totalOwnerEarnings: 0,
                totalDiscount: 0,
                totalBookings: 0,
                premiumBookings: 0,
                refundedBookings: 0,
                averageOrderValue: 0
            }));
        });
    }
    ;
};
exports.BookingRepository = BookingRepository;
exports.BookingRepository = BookingRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.BookingModel)),
    __metadata("design:paramtypes", [mongoose_1.Model])
], BookingRepository);
;
