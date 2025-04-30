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
let BookingController = class BookingController {
    bookingService;
    constructor(bookingService) {
        this.bookingService = bookingService;
    }
    ;
    async creatBooking(req, res, next) {
        try {
            const { user } = req;
            const userId = user?.userId;
            const bookingData = {
                userId: userId,
                carId: req.body.carId,
                ownerId: req.body.ownerId,
                userDetails: req.body.userDetails,
                pickupLocation: req.body.pickupLocation,
                dropoffLocation: req.body.dropoffLocation,
                pickupDateTime: req.body.pickupDateTime,
                dropoffDateTime: req.body.dropoffDateTime,
                totalPrice: req.body.totalPrice,
                paymentStatus: 'completed',
                paymentMethod: req.body.paymentMethod,
                paymentId: req.body.paymentId,
                status: 'active',
            };
            const booking = await this.bookingService.createBooking(bookingData);
            res.status(types_js_2.StatusCode.CREATED).json(http_response_js_1.HttpResponse.created(booking, "Your Booking confirmed"));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async fetchUserRentals(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 4;
            const { user } = req;
            const userId = user?.userId;
            const userRentals = await this.bookingService.fetchUserRentals(userId, page, limit);
            console.log(userRentals);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(userRentals));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async fetchOwnerAllBookings(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 8;
            const { user } = req;
            const userId = user?.userId;
            const userRentals = await this.bookingService.getCarBookingsOfOwner(userId, page, limit);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(userRentals));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async changeBookingStatus(req, res, next) {
        try {
            const bookingId = req.params.id;
            const { status } = req.body;
            const updatedBooking = await this.bookingService.changeBookingStatus(bookingId, status);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(updatedBooking));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
    async getLatestBooking(req, res, next) {
        try {
            const bookingId = req.params.id;
            const latestBooking = await this.bookingService.getLatestBooking(bookingId);
            res.status(types_js_2.StatusCode.OK).json(http_response_js_1.HttpResponse.success(latestBooking));
        }
        catch (error) {
            next(error);
        }
        ;
    }
    ;
};
BookingController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_js_1.default.IBookingService)),
    __metadata("design:paramtypes", [Object])
], BookingController);
exports.default = BookingController;
;
//# sourceMappingURL=booking.controller.js.map