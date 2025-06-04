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
let AdminController = class AdminController {
    constructor(_userService, _ownerService, _carService) {
        this._userService = _userService;
        this._ownerService = _ownerService;
        this._carService = _carService;
    }
    ;
    fetchUsers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 6;
                const search = req.query.search || '';
                const users = yield this._userService.fetchAllUsers(page, limit, search);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(users));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    fethcOwners(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 6;
                const search = req.query.search || '';
                const owners = yield this._ownerService.getAllOwners(page, limit, search);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(owners));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    getPendingCars(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pendingCars = yield this._carService.fetchPendingCars();
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(pendingCars));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    verifyCar(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const carId = req.params.id;
                const car = yield this._carService.verifyCar(carId);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(car));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    rejectCar(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const carId = req.params.id;
                const { rejectionReason } = req.body;
                const car = yield this._carService.rejectCar(carId, rejectionReason);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(car));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    blockOrUnblockUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const blockedUser = yield this._userService.blockOrUnblockUser(userId);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(blockedUser));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    blockOrUnblockOwner(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ownerId = req.params.id;
                const blockedOwner = yield this._ownerService.blockOrUnblockOwner(ownerId);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(blockedOwner));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
};
AdminController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.IUserService)),
    __param(1, (0, inversify_1.inject)(types_1.default.IOwnerService)),
    __param(2, (0, inversify_1.inject)(types_1.default.ICarService)),
    __metadata("design:paramtypes", [Object, Object, Object])
], AdminController);
exports.default = AdminController;
;
