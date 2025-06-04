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
exports.CarRepository = void 0;
const inversify_1 = require("inversify");
const base_repository_1 = require("./base.repository");
const types_1 = __importDefault(require("../di/types"));
const mongoose_1 = require("mongoose");
const http_error_1 = require("../utils/http.error");
const types_2 = require("../types/types");
let CarRepository = class CarRepository extends base_repository_1.BaseRepository {
    constructor(_carModel) {
        super(_carModel);
        this._carModel = _carModel;
    }
    ;
    addCar(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._carModel.create(data);
        });
    }
    ;
    countCars(ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._carModel.find({ ownerId }).countDocuments();
        });
    }
    editCar(carId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedCar = yield this._carModel.findByIdAndUpdate(carId, data, { new: true });
            if (!updatedCar) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't update car data");
            }
            return updatedCar;
        });
    }
    ;
    findByOwner(ownerId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const data = yield this._carModel.find({ ownerId: ownerId })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec();
            const total = yield this._carModel.countDocuments();
            return {
                data,
                total
            };
        });
    }
    ;
    findPaginated(page, limit, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const query = Object.assign({ isListed: true }, this.buildFilterQuery(filters));
            const data = yield this._carModel.find(query).skip(skip).limit(limit);
            const total = yield this._carModel.countDocuments(query);
            return { data, total };
        });
    }
    findPaginatedWithDistance(userLocation, page, limit, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const filterQuery = this.buildFilterQuery(filters);
            const geoNearOptions = {
                near: { type: "Point", coordinates: userLocation },
                distanceField: "distance",
                spherical: true,
                query: Object.assign({ isVerified: true, isListed: true }, filterQuery)
            };
            if (filters.maxDistance !== undefined) {
                geoNearOptions.maxDistance = filters.maxDistance * 1000;
            }
            if (filters.minDistance !== undefined) {
                geoNearOptions.minDistance = filters.minDistance * 1000;
            }
            const pipeline = [
                {
                    $geoNear: geoNearOptions
                },
                {
                    $set: {
                        distance: { $divide: ["$distance", 1000] }
                    }
                }
            ];
            if (filters.search) {
                pipeline.push({
                    $match: {
                        $or: [
                            { carName: { $regex: filters.search, $options: 'i' } },
                            { description: { $regex: filters.search, $options: 'i' } }
                        ]
                    }
                });
            }
            pipeline.push({ $sort: { distance: 1 } }, { $skip: skip }, { $limit: limit });
            const result = yield this._carModel.aggregate(pipeline);
            let countPipeline = [];
            if (filters.minDistance !== undefined || filters.maxDistance !== undefined) {
                const countGeoNearOptions = {
                    near: { type: "Point", coordinates: userLocation },
                    distanceField: "distance",
                    spherical: true,
                    query: Object.assign({ isVerified: true, isListed: true }, filterQuery)
                };
                if (filters.maxDistance !== undefined) {
                    countGeoNearOptions.maxDistance = filters.maxDistance * 1000;
                }
                if (filters.minDistance !== undefined) {
                    countGeoNearOptions.minDistance = filters.minDistance * 1000;
                }
                countPipeline = [
                    {
                        $geoNear: countGeoNearOptions
                    }
                ];
                if (filters.search) {
                    countPipeline.push({
                        $match: {
                            $or: [
                                { carName: { $regex: filters.search, $options: 'i' } },
                                { description: { $regex: filters.search, $options: 'i' } }
                            ]
                        }
                    });
                }
                countPipeline.push({ $count: 'total' });
                const countResult = yield this._carModel.aggregate(countPipeline);
                const total = countResult.length > 0 ? countResult[0].total : 0;
                return { data: result, total };
            }
            else {
                let countQuery = Object.assign({ isVerified: true, isListed: true }, filterQuery);
                if (filters.search) {
                    countQuery = Object.assign(Object.assign({}, countQuery), { $or: [
                            { carName: { $regex: filters.search, $options: 'i' } },
                            { description: { $regex: filters.search, $options: 'i' } }
                        ] });
                }
                const total = yield this._carModel.countDocuments(countQuery);
                return { data: result, total };
            }
        });
    }
    getCarDocumentsById(carId) {
        return __awaiter(this, void 0, void 0, function* () {
            const car = yield this._carModel.findById(carId);
            if (!car)
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, 'Car not found');
            return {
                rcUrl: car.rcDoc,
                pucUrl: car.pucDoc,
                insuranceUrl: car.insuranceDoc,
            };
        });
    }
    ;
    buildFilterQuery(filters) {
        var _a, _b, _c, _d, _e;
        const query = { isVerified: true };
        if ((_a = filters.carType) === null || _a === void 0 ? void 0 : _a.length) {
            query.carType = { $in: filters.carType };
        }
        if ((_b = filters.transmission) === null || _b === void 0 ? void 0 : _b.length) {
            query.transmission = { $in: filters.transmission };
        }
        if ((_c = filters.fuelType) === null || _c === void 0 ? void 0 : _c.length) {
            query.fuelType = { $in: filters.fuelType };
        }
        if ((_d = filters.seats) === null || _d === void 0 ? void 0 : _d.length) {
            query.seats = { $in: filters.seats };
        }
        if ((_e = filters.fuelOption) === null || _e === void 0 ? void 0 : _e.length) {
            query.fuelOption = { $in: filters.fuelOption };
        }
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            query.pricePerHour = {};
            if (filters.minPrice !== undefined) {
                query.pricePerHour.$gte = filters.minPrice;
            }
            if (filters.maxPrice !== undefined) {
                query.pricePerHour.$lte = filters.maxPrice;
            }
        }
        return query;
    }
    ;
    findMaxPrice() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._carModel.findOne()
                .sort({ pricePerHour: -1 })
                .select('pricePerHour')
                .exec();
            return result ? result.pricePerHour : 5000;
        });
    }
};
exports.CarRepository = CarRepository;
exports.CarRepository = CarRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.CarModel)),
    __metadata("design:paramtypes", [mongoose_1.Model])
], CarRepository);
;
