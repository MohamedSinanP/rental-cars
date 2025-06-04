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
let DashboardController = class DashboardController {
    constructor(_dashboardService) {
        this._dashboardService = _dashboardService;
    }
    getStatsForAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield this._dashboardService.getStatsForAdmin();
                res.status(200).json(http_response_1.HttpResponse.success(stats));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    getRentalStatsForAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { type, year, from, to } = req.query;
                const validType = typeof type === 'string' ? type : 'monthly';
                const validYear = year ? Number(year) : new Date().getFullYear();
                const validFrom = typeof from === 'string' ? from : '';
                const validTo = typeof to === 'string' ? to : '';
                const rentalStats = yield this._dashboardService.getRentalStatsForAdmin(validType, validYear, validFrom, validTo);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(rentalStats));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    getStatsForOwner(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const ownerId = user === null || user === void 0 ? void 0 : user.userId;
                const stats = yield this._dashboardService.getStatsForOwner(ownerId);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(stats));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    getRentalStatsForOwner(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const ownerId = user === null || user === void 0 ? void 0 : user.userId;
                const { type, year, from, to } = req.query;
                const validType = typeof type === 'string' ? type : 'monthly';
                const validYear = year ? Number(year) : new Date().getFullYear();
                const validFrom = typeof from === 'string' ? from : '';
                const validTo = typeof to === 'string' ? to : '';
                const stats = yield this._dashboardService.getRentalStatsForOwner(ownerId, validType, validYear, validFrom, validTo);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(stats));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    getAllBookingsForAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 6;
                const { type, year, from, to } = req.query;
                const validType = typeof type === 'string' ? type : 'monthly';
                const validYear = year ? Number(year) : new Date().getFullYear();
                const validFrom = typeof from === 'string' ? from : '';
                const validTo = typeof to === 'string' ? to : '';
                const bookings = yield this._dashboardService.getAllRentalsForAdmin(page, limit, validType, validYear, validFrom, validTo);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(bookings));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
};
DashboardController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.IDashboardService)),
    __metadata("design:paramtypes", [Object])
], DashboardController);
exports.default = DashboardController;
;
