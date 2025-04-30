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
const http_error_js_1 = require("../utils/http.error.js");
const types_js_2 = require("../types/types.js");
let BookingService = class BookingService {
    _bookingRepository;
    constructor(_bookingRepository) {
        this._bookingRepository = _bookingRepository;
    }
    ;
    async createBooking(data) {
        const { carId, pickupDateTime, dropoffDateTime } = data;
        const isBooked = await this._bookingRepository.isBooked(carId, pickupDateTime, dropoffDateTime);
        if (isBooked) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Car is already booked for the selected time period");
        }
        const booking = await this._bookingRepository.bookCar(data);
        if (!booking) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Can't add your booking");
        }
        return booking;
    }
    async fetchUserRentals(id, page, limit) {
        const { data, total } = await this._bookingRepository.findPaginated(page, limit);
        if (!data) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.NOT_FOUND, "Can't get the cars.");
        }
        ;
        const totalPages = Math.ceil(total / limit);
        return {
            data,
            totalPages,
            currentPage: page,
        };
    }
    ;
    async getCarBookingsOfOwner(id, page, limit) {
        const { data, total } = await this._bookingRepository.findAllByOwnerId(id, page, limit);
        if (!data) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.NOT_FOUND, "Can't get the cars.");
        }
        ;
        const totalPages = Math.ceil(total / limit);
        return {
            data,
            totalPages,
            currentPage: page,
        };
    }
    ;
    async changeBookingStatus(bookingId, status) {
        const updatedBooking = await this._bookingRepository.update(bookingId, { status: status });
        if (!updatedBooking) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Can't update booking status");
        }
        return updatedBooking;
    }
    ;
    async getLatestBooking(bookingId) {
        const latestBooking = await this._bookingRepository.findById(bookingId);
        if (!latestBooking) {
            throw new http_error_js_1.HttpError(types_js_2.StatusCode.BAD_REQUEST, "Can't update booking status");
        }
        return latestBooking;
    }
    ;
};
BookingService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_js_1.default.IBookingRepository)),
    __metadata("design:paramtypes", [Object])
], BookingService);
exports.default = BookingService;
;
//# sourceMappingURL=booking.service.js.map