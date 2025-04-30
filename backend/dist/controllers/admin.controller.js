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
let AdminController = class AdminController {
    userService;
    ownerService;
    carService;
    constructor(userService, ownerService, carService) {
        this.userService = userService;
        this.ownerService = ownerService;
        this.carService = carService;
    }
    ;
    async fetchUsers(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 6;
            const users = await this.userService.fetchAllUsers(page, limit);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(users));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async fethcOwners(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 6;
            const owners = await this.ownerService.getAllOwners(page, limit);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(owners));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async getPendingCars(req, res, next) {
        try {
            const pendingCars = await this.carService.fetchPendingCars();
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(pendingCars));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async verifyCar(req, res, next) {
        try {
            const carId = req.params.id;
            const car = await this.carService.verifyCar(carId);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(car));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async rejectCar(req, res, next) {
        try {
            console.log("hehehehe");
            const carId = req.params.id;
            const { rejectionReason } = req.body;
            const car = await this.carService.rejectCar(carId, rejectionReason);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(car));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async blockOrUnblockUser(req, res, next) {
        try {
            const userId = req.params.id;
            const blockedUser = await this.userService.blockOrUnblockUser(userId);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(blockedUser));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async blockOrUnblockOwner(req, res, next) {
        try {
            const ownerId = req.params.id;
            const blockedOwner = await this.ownerService.blockOrUnblockOwner(ownerId);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(blockedOwner));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
};
AdminController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_js_1.default.IUserService)),
    __param(1, (0, inversify_1.inject)(types_js_1.default.IOwnerService)),
    __param(2, (0, inversify_1.inject)(types_js_1.default.ICarService)),
    __metadata("design:paramtypes", [Object, Object, Object])
], AdminController);
exports.default = AdminController;
;
//# sourceMappingURL=admin.controller.js.map