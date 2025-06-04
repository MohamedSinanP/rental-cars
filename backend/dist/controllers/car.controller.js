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
const http_response_1 = require("../utils/http.response");
const types_2 = require("../types/types");
let CarController = class CarController {
    constructor(_carService) {
        this._carService = _carService;
    }
    ;
    createCar(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const ownerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const parsedLocation = JSON.parse(req.body.location);
                const parsedCarImages = JSON.parse(req.body.carImages);
                const carData = {
                    carName: req.body.carName,
                    carModel: req.body.carModel,
                    carType: req.body.carType,
                    seats: req.body.seats,
                    transmission: req.body.transmission,
                    fuelType: req.body.fuelType,
                    fuelOption: req.body.fuelOption,
                    ownerId,
                    carImages: parsedCarImages,
                    location: parsedLocation,
                    status: req.body.status,
                    features: req.body.features,
                    pricePerHour: Number(req.body.pricePerHour),
                    deposit: Number(req.body.deposit),
                    lastmaintenanceDate: req.body.lastmaintenanceDate,
                    maintenanceInterval: Number(req.body.maintenanceInterval),
                    isListed: true,
                    rcDoc: req.files.rcDoc,
                    pucDoc: req.files.pucDoc,
                    insuranceDoc: req.files.insuranceDoc,
                };
                const newCar = yield this._carService.createCar(carData);
                res.status(types_2.StatusCode.CREATED).json(http_response_1.HttpResponse.created(newCar, "New car added successfully.Your car will be hosted after verification"));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    editCar(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const carId = req.body.carId;
                const ownerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const parsedLocation = JSON.parse(req.body.location);
                const parsedCarImages = JSON.parse(req.body.carImages);
                const carData = {
                    carName: req.body.carName,
                    carModel: req.body.carModel,
                    carType: req.body.carType,
                    seats: req.body.seats,
                    transmission: req.body.transmission,
                    fuelType: req.body.fuelType,
                    fuelOption: req.body.fuelOption,
                    ownerId,
                    carImages: parsedCarImages,
                    location: parsedLocation,
                    status: req.body.status,
                    features: req.body.features,
                    pricePerHour: Number(req.body.pricePerHour),
                    deposit: Number(req.body.deposit),
                    lastmaintenanceDate: req.body.lastmaintenanceDate,
                    maintenanceInterval: Number(req.body.maintenanceInterval),
                    isListed: true,
                };
                if (req.files) {
                    if (req.files.rcDoc) {
                        carData.rcDoc = req.files.rcDoc;
                    }
                    if (req.files.pucDoc) {
                        carData.pucDoc = req.files.pucDoc;
                    }
                    if (req.files.insuranceDoc) {
                        carData.insuranceDoc = req.files.insuranceDoc;
                    }
                }
                ;
                const updatedCar = yield this._carService.editCar(carId, carData);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(updatedCar));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    toggleCarListing(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const ownerId = user === null || user === void 0 ? void 0 : user.userId;
                const carId = req.params.carId;
                const updatedCar = yield this._carService.toggleCarListing(ownerId, carId);
                res
                    .status(types_2.StatusCode.OK)
                    .json(http_response_1.HttpResponse.success(updatedCar, "Car listing status updated successfully"));
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
    reuploadCarDocs(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const carId = req.params.id;
                const carDocs = {
                    rcDoc: req.files.rcDoc,
                    pucDoc: req.files.pucDoc,
                    insuranceDoc: req.files.insuranceDoc
                };
                const updatedCar = yield this._carService.reuploadCarDocs(carId, carDocs);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(updatedCar, "Your documents will verified in 24 hours"));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    getAddressFromCoordinates(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { lng, lat } = req.query;
                const address = yield this._carService.fetchCarLocationAddresss(Number(lng), Number(lat));
                res.status(types_2.StatusCode.OK).json({ address });
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    fetchOwnerVerifedCars(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const userId = user === null || user === void 0 ? void 0 : user.userId;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 6;
                if (userId) {
                    const cars = yield this._carService.fetchOwnerVerifedCars(userId, page, limit);
                    res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(cars));
                }
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    fetchOwnerAllCars(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const userId = user === null || user === void 0 ? void 0 : user.userId;
                if (userId) {
                    const cars = yield this._carService.fetchOwnerCars(userId);
                    res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success({ cars }));
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllCars(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 6;
                const { user } = req;
                // Extract filter parameters from request query
                const filters = {
                    carType: req.query.carType || [],
                    transmission: req.query.transmission || [],
                    fuelType: req.query.fuelType || [],
                    seats: req.query.seats || [],
                    fuelOption: req.query.fuelOption || [],
                    minPrice: parseInt(req.query.minPrice) || 0,
                    maxPrice: parseInt(req.query.maxPrice) || 5000,
                    search: req.query.search || ''
                };
                // Handle min and max distance filters if provided
                if (req.query.minDistance) {
                    const minDistance = parseInt(req.query.minDistance);
                    if (!isNaN(minDistance)) {
                        filters.minDistance = minDistance;
                    }
                }
                if (req.query.maxDistance) {
                    const maxDistance = parseInt(req.query.maxDistance);
                    if (!isNaN(maxDistance)) {
                        filters.maxDistance = maxDistance;
                    }
                }
                // Get max values from the service
                const maxValues = yield this._carService.getMaxPriceAndDistance();
                let result;
                if (user) {
                    result = yield this._carService.fetchCarsWithDistance(user.userId, page, limit, filters);
                }
                else {
                    result = yield this._carService.fetchCarsWithoutDistance(page, limit, filters);
                }
                // Add max values to the response
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(Object.assign(Object.assign({}, result), { maxPrice: maxValues.maxPrice, maxDistance: maxValues.maxDistance })));
            }
            catch (error) {
                next(error);
            }
        });
    }
    carDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const car = yield this._carService.fetchCarDetails(id);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(car));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    similarCars(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const cars = yield this._carService.fetchSimilarCars(id);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(cars));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    getCarDocsDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const carId = req.params.id;
                const { userMessage } = req.body;
                const result = yield this._carService.getCarDocsDetails(carId, userMessage);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success({ answer: result }));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
};
CarController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.ICarService)),
    __metadata("design:paramtypes", [Object])
], CarController);
exports.default = CarController;
;
