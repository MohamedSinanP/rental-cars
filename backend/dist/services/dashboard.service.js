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
const types_2 = require("../types/types");
const http_error_1 = require("../utils/http.error");
const helperFunctions_1 = require("../utils/helperFunctions");
let DashboardService = class DashboardService {
    constructor(_userRepository, _ownerRepository, _bookingRepository, _userSubsRepository, _carRepository) {
        this._userRepository = _userRepository;
        this._ownerRepository = _ownerRepository;
        this._bookingRepository = _bookingRepository;
        this._userSubsRepository = _userSubsRepository;
        this._carRepository = _carRepository;
    }
    ;
    getStatsForAdmin() {
        return __awaiter(this, void 0, void 0, function* () {
            const totalUsers = yield this._userRepository.countUsers();
            const totalOwners = yield this._ownerRepository.countOwners();
            const commisionEarnings = yield this._bookingRepository.getTotalAdminEarnings();
            const subscriptionEarnings = yield this._userSubsRepository.getTotalSubscriptionEarnings();
            const totalBookings = yield this._bookingRepository.getTotalBookingCount();
            const totalEarnings = commisionEarnings + subscriptionEarnings;
            return {
                totalUsers,
                totalOwners,
                subscriptionEarnings,
                totalEarnings,
                totalCommission: commisionEarnings,
                totalBookings
            };
        });
    }
    ;
    getRentalStatsForAdmin(type, year, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const retnalStats = yield this._bookingRepository.getRentalStatsForAdmin(type, year, from, to);
            if (!retnalStats) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't find booking stats");
            }
            ;
            return retnalStats;
        });
    }
    ;
    getStatsForOwner(ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalEarnings = yield this._bookingRepository.getTotalOwnerEarnings();
            const totalCars = yield this._carRepository.countCars(ownerId);
            const totalBookings = yield this._bookingRepository.bookingCountOfOwnerCars(ownerId);
            const platformCommission = yield this._bookingRepository.getTotalAdminCommissionForOwner(ownerId);
            return {
                totalEarnings,
                totalCars,
                totalBookings,
                platformCommission
            };
        });
    }
    getRentalStatsForOwner(ownerId, type, year, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const retnalStats = yield this._bookingRepository.getRentalStatsForOwner(ownerId, type, year, from, to);
            if (!retnalStats) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't find booking stats");
            }
            ;
            return retnalStats;
        });
    }
    ;
    getAllRentalsForAdmin(page, limit, type, year, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, total } = yield this._bookingRepository.getAllRentalsForAdmin(page, limit, type, year, from, to);
            if (!data) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Bookings not found");
            }
            ;
            const totalPages = Math.ceil(total / limit);
            return {
                data: data.map(helperFunctions_1.toBookingDTO),
                totalPages,
                currentPage: page
            };
        });
    }
};
DashboardService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.IUserRepository)),
    __param(1, (0, inversify_1.inject)(types_1.default.IOwnerRepository)),
    __param(2, (0, inversify_1.inject)(types_1.default.IBookingRepository)),
    __param(3, (0, inversify_1.inject)(types_1.default.IUserSubsRepository)),
    __param(4, (0, inversify_1.inject)(types_1.default.ICarRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], DashboardService);
exports.default = DashboardService;
;
