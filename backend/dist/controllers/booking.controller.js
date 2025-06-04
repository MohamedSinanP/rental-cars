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
const invoiceGenerator_1 = require("../utils/invoiceGenerator");
const salesReportGenerator_1 = require("../utils/salesReportGenerator");
let BookingController = class BookingController {
    constructor(_bookingService) {
        this._bookingService = _bookingService;
    }
    ;
    creatBooking(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const userId = user === null || user === void 0 ? void 0 : user.userId;
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
                const booking = yield this._bookingService.createBooking(bookingData);
                res.status(types_2.StatusCode.CREATED).json(http_response_1.HttpResponse.created(booking, "Your Booking confirmed"));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    fetchUserRentals(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 4;
                const { user } = req;
                const userId = user === null || user === void 0 ? void 0 : user.userId;
                const userRentals = yield this._bookingService.fetchUserRentals(userId, page, limit);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(userRentals));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    fetchOwnerAllBookings(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 8;
                const { user } = req;
                const userId = user === null || user === void 0 ? void 0 : user.userId;
                const userRentals = yield this._bookingService.getCarBookingsOfOwner(userId, page, limit);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(userRentals));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    changeBookingStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookingId = req.params.id;
                const { status } = req.body;
                const updatedBooking = yield this._bookingService.changeBookingStatus(bookingId, status);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(updatedBooking));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    getLatestBooking(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookingId = req.params.id;
                const latestBooking = yield this._bookingService.getLatestBooking(bookingId);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(latestBooking));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    cancelBooking(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookingId = req.params.id;
                const updatedBooking = yield this._bookingService.cancelBooking(bookingId);
                res.status(types_2.StatusCode.OK).json(http_response_1.HttpResponse.success(updatedBooking));
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    invoiceForUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookingId = req.params.id;
                const booking = yield this._bookingService.getBookingById(bookingId);
                yield (0, invoiceGenerator_1.generateInvoicePDF)(res, booking);
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    getSalesReportPdf(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { type, year, from, to, month } = req.query;
                // Validate and convert query parameters
                const validType = typeof type === 'string' && ['yearly', 'monthly', 'custom'].includes(type)
                    ? type
                    : 'monthly';
                const validYear = year ? Number(year) : new Date().getFullYear();
                const validMonth = month ? Number(month) : undefined;
                const validFrom = typeof from === 'string' ? from : '';
                const validTo = typeof to === 'string' ? to : '';
                // Get sales data from service
                const salesData = yield this._bookingService.getSalesInformation(validType, validYear, validMonth, validFrom, validTo);
                // Generate and send the PDF report
                yield (0, salesReportGenerator_1.generateSalesReportPDF)(res, salesData, {
                    type: validType,
                    year: validYear,
                    month: validMonth,
                    from: validFrom,
                    to: validTo
                });
            }
            catch (error) {
                console.error('Error generating sales report:', error);
                next(error);
            }
        });
    }
};
BookingController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.IBookingService)),
    __metadata("design:paramtypes", [Object])
], BookingController);
exports.default = BookingController;
;
