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
exports.BookingRepository = void 0;
const mongoose_1 = require("mongoose");
const base_repository_js_1 = require("./base.repository.js");
const types_js_1 = __importDefault(require("../di/types.js"));
const inversify_1 = require("inversify");
let BookingRepository = class BookingRepository extends base_repository_js_1.BaseRepository {
    bookingModel;
    constructor(bookingModel) {
        super(bookingModel);
        this.bookingModel = bookingModel;
    }
    ;
    async bookCar(data) {
        return await this.bookingModel.create(data);
    }
    ;
    async findOne(query) {
        return this.bookingModel.findOne(query).exec();
    }
    async findAllByUserId(userId) {
        return await this.bookingModel.find({ userId })
            .populate('userId')
            .populate('carId');
    }
    ;
    async findAllByOwnerId(ownerId, page, limit) {
        const skip = (page - 1) * limit;
        const data = await this.bookingModel.find({ ownerId })
            .populate('carId')
            .populate('ownerId')
            .populate('userId')
            .skip(skip).limit(limit);
        const total = await this.bookingModel.countDocuments();
        return { data, total };
    }
    ;
    async findPaginated(page, limit) {
        const skip = (page - 1) * limit;
        const data = await this.bookingModel.find()
            .populate('carId')
            .populate('ownerId')
            .populate('userId')
            .skip(skip).limit(limit);
        const total = await this.bookingModel.countDocuments();
        return { data, total };
    }
    ;
    async isBooked(carId, pickupDateTime, dropoffDateTime) {
        const carObjId = new mongoose_1.Types.ObjectId(carId);
        const isBooked = await this.bookingModel.findOne({
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
    }
};
exports.BookingRepository = BookingRepository;
exports.BookingRepository = BookingRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_js_1.default.BookingModel)),
    __metadata("design:paramtypes", [mongoose_1.Model])
], BookingRepository);
;
//# sourceMappingURL=booking.repository.js.map