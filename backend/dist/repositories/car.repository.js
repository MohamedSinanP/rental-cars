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
exports.CarRepository = void 0;
const inversify_1 = require("inversify");
const base_repository_js_1 = require("./base.repository.js");
const types_js_1 = __importDefault(require("../di/types.js"));
const mongoose_1 = require("mongoose");
const http_error_js_1 = require("../utils/http.error.js");
const types_js_2 = require("../types/types.js");
let CarRepository = class CarRepository extends base_repository_js_1.BaseRepository {
    carModel;
    constructor(carModel) {
        super(carModel);
        this.carModel = carModel;
    }
    ;
    async addCar(data) {
        return await this.carModel.create(data);
    }
    ;
    async editCar(carId, data) {
        const updatedCar = await this.carModel.findByIdAndUpdate(carId, data, { new: true });
        if (!updatedCar) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Can't update car data");
        }
        return updatedCar;
    }
    ;
    async findByOwner(ownerId, page, limit) {
        const skip = (page - 1) * limit;
        const data = await this.carModel.find({ ownerId: ownerId, isVerified: true, verificationRejected: false })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();
        const total = await this.carModel.countDocuments();
        return {
            data,
            total
        };
    }
    ;
    async findPaginated(page, limit) {
        const skip = (page - 1) * limit;
        const data = await this.carModel.find().skip(skip).limit(limit);
        const total = await this.carModel.countDocuments();
        return { data, total };
    }
    ;
    async findPaginatedWithDistance(userLocation, page, limit) {
        const skip = (page - 1) * limit;
        const result = await this.carModel.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: userLocation },
                    distanceField: "distance",
                    spherical: true,
                    query: { isVerified: true }
                }
            },
            {
                $set: {
                    distance: { $divide: ["$distance", 1000] }
                }
            },
            {
                $sort: { distance: 1 }
            },
            { $skip: skip },
            { $limit: limit }
        ]);
        const total = await this.carModel.countDocuments({ isValid: true });
        return { data: result, total };
    }
    ;
    async getCarDocumentsById(carId) {
        const car = await this.carModel.findById(carId);
        if (!car)
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, 'Car not found');
        return {
            rcUrl: car.rcDoc,
            pucUrl: car.pucDoc,
            insuranceUrl: car.insuranceDoc,
        };
    }
    ;
};
exports.CarRepository = CarRepository;
exports.CarRepository = CarRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_js_1.default.CarModel)),
    __metadata("design:paramtypes", [mongoose_1.Model])
], CarRepository);
;
//# sourceMappingURL=car.repository.js.map