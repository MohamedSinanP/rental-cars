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
const http_response_js_1 = require("../utils/http.response.js");
const types_js_2 = require("../types/types.js");
let CarController = class CarController {
    _carService;
    constructor(_carService) {
        this._carService = _carService;
    }
    ;
    async createCar(req, res, next) {
        try {
            const ownerId = req.user?.userId;
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
                availability: req.body.availability,
                features: req.body.features,
                pricePerDay: Number(req.body.pricePerDay),
                deposit: Number(req.body.deposit),
                lastmaintenanceDate: req.body.lastmaintenanceDate,
                maintenanceInterval: Number(req.body.maintenanceInterval),
                isListed: true,
                rcDoc: req.files.rcDoc,
                pucDoc: req.files.pucDoc,
                insuranceDoc: req.files.insuranceDoc,
            };
            const newCar = await this._carService.createCar(carData);
            res.status(types_js_2.StatusCode.CREATED).json(http_response_js_1.HttpResponse.created(newCar, "New car added successfully.Your car will be hosted after verification"));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async editCar(req, res, next) {
        try {
            const carId = req.body.carId;
            const ownerId = req.user?.userId;
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
                availability: req.body.availability,
                features: req.body.features,
                pricePerDay: Number(req.body.pricePerDay),
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
            const updatedCar = await this._carService.editCar(carId, carData);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(updatedCar));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async reuploadCarDocs(req, res, next) {
        try {
            const carId = req.params.id;
            const carDocs = {
                rcDoc: req.files.rcDoc,
                pucDoc: req.files.pucDoc,
                insuranceDoc: req.files.insuranceDoc
            };
            const updatedCar = await this._carService.reuploadCarDocs(carId, carDocs);
            res.status(200).json(http_response_js_1.HttpResponse.success(updatedCar, "Your documents will verified in 24 hours"));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async getAddressFromCoordinates(req, res, next) {
        try {
            const { lng, lat } = req.query;
            const address = await this._carService.fetchCarLocationAddresss(Number(lng), Number(lat));
            res.status(types_js_2.StatusCode.OK).json({ address });
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async fetchOwnerVerifedCars(req, res, next) {
        try {
            const { user } = req;
            const userId = user?.userId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 6;
            if (userId) {
                const cars = await this._carService.fetchOwnerVerifedCars(userId, page, limit);
                res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(cars));
            }
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async fetchOwnerAllCars(req, res, next) {
        try {
            const { user } = req;
            const userId = user?.userId;
            if (userId) {
                const cars = await this._carService.fetchOwnerCars(userId);
                res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success({ cars }));
            }
        }
        catch (error) {
            next(error);
        }
    }
    async getAllCars(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 6;
            const { user } = req;
            let result;
            if (user) {
                result = await this._carService.fetchCarsWithDistance(user.userId, page, limit);
            }
            else {
                result = await this._carService.fetchCarsWithoutDistance(page, limit);
            }
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(result));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async carDetails(req, res, next) {
        try {
            const id = req.params.id;
            const car = await this._carService.fetchCarDetails(id);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(car));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async similarCars(req, res, next) {
        try {
            const id = req.params.id;
            const cars = await this._carService.fetchSimilarCars(id);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(cars));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async getCarDocsDetails(req, res, next) {
        try {
            const carId = req.params.id;
            const { userMessage } = req.body;
            const result = await this._carService.getCarDocsDetails(carId, userMessage);
            res.status(200).json(http_response_js_1.HttpResponse.success(result));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
};
CarController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_js_1.default.ICarService)),
    __metadata("design:paramtypes", [Object])
], CarController);
exports.default = CarController;
;
//# sourceMappingURL=car.controller.js.map