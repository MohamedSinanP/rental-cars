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
const http_error_1 = require("../utils/http.error");
const types_2 = require("../types/types");
const mongoose_1 = require("mongoose");
const helperFunctions_1 = require("../utils/helperFunctions");
let BookingService = class BookingService {
    constructor(_bookingRepository, _addressRepository, _carRepository, _walletRepository, _userSubsRepository) {
        this._bookingRepository = _bookingRepository;
        this._addressRepository = _addressRepository;
        this._carRepository = _carRepository;
        this._walletRepository = _walletRepository;
        this._userSubsRepository = _userSubsRepository;
    }
    ;
    createBooking(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, carId, userDetails } = data;
            const carObjId = new mongoose_1.Types.ObjectId(carId);
            const { name, email, phoneNumber, address } = userDetails;
            const isBooked = yield this._carRepository.findOne({ _id: carObjId, status: "Booked" });
            if (isBooked) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Car is already booked for the selected time period");
            }
            ;
            const bookedCar = yield this._carRepository.findOne({ _id: carObjId }, [{ path: 'ownerId' }]);
            const DEFAULT_COMMISSION_PERCENTAGE = 10;
            let commissionPercentage = DEFAULT_COMMISSION_PERCENTAGE;
            if (bookedCar && 'ownerId' in bookedCar && bookedCar.ownerId && 'commission' in bookedCar.ownerId) {
                commissionPercentage = bookedCar.ownerId.commission;
            }
            const adminCommissionAmount = (data.totalPrice * commissionPercentage) / 100;
            const ownerEarning = data.totalPrice - adminCommissionAmount;
            const bookingData = Object.assign(Object.assign({}, data), { commissionPercentage,
                adminCommissionAmount,
                ownerEarning });
            let booking;
            if (data.paymentMethod === 'wallet') {
                const userObjId = new mongoose_1.Types.ObjectId(userId);
                const userWallet = yield this._walletRepository.findOne({ userId: userObjId });
                if (!userWallet || userWallet.balance < data.totalPrice) {
                    throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Insufficient wallet balance");
                }
                yield this._walletRepository.refundToWallet(userId, data.totalPrice);
            }
            ;
            booking = yield this._bookingRepository.bookCar(bookingData);
            yield this._carRepository.update(carId, { status: "Booked" });
            const existingAddress = yield this._addressRepository.findOne({ name, email, phoneNumber, address });
            if (!existingAddress) {
                yield this._addressRepository.addNewAddress({ userId, name, email, phoneNumber, address });
            }
            ;
            if (!booking) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't add your booking");
            }
            return (0, helperFunctions_1.toBookingDTO)(booking);
        });
    }
    fetchUserRentals(id, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, total } = yield this._bookingRepository.findPaginated(id, page, limit);
            if (!data) {
                throw new http_error_1.HttpError(types_2.StatusCode.NOT_FOUND, "Can't get the cars.");
            }
            const totalPages = Math.ceil(total / limit);
            return {
                data: data.map(helperFunctions_1.toBookingDTO),
                totalPages,
                currentPage: page,
            };
        });
    }
    getCarBookingsOfOwner(id, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, total } = yield this._bookingRepository.findAllByOwnerId(id, page, limit);
            if (!data) {
                throw new http_error_1.HttpError(types_2.StatusCode.NOT_FOUND, "Can't get the cars.");
            }
            const totalPages = Math.ceil(total / limit);
            return {
                data: data.map(helperFunctions_1.toBookingDTO),
                totalPages,
                currentPage: page,
            };
        });
    }
    changeBookingStatus(bookingId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedBooking = yield this._bookingRepository.update(bookingId, { status });
            if (!updatedBooking) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't update booking status");
            }
            if (status === "cancelled") {
                const carId = updatedBooking.carId.toString();
                const userId = updatedBooking.userId.toString();
                const refundAmount = updatedBooking.totalPrice;
                const transactionId = `refund-${updatedBooking._id}`;
                yield this._carRepository.update(carId, { status: "Available" });
                yield this._walletRepository.refundToWallet(userId, refundAmount, transactionId);
            }
            if (status === "completed") {
                yield this._carRepository.update(updatedBooking.carId.toString(), {
                    status: "Available",
                });
            }
            return (0, helperFunctions_1.toBookingDTO)(updatedBooking);
        });
    }
    getLatestBooking(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const latestBooking = yield this._bookingRepository.findById(bookingId);
            if (!latestBooking) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't update booking status");
            }
            return (0, helperFunctions_1.toBookingDTO)(latestBooking);
        });
    }
    ;
    cancelBooking(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = yield this._bookingRepository.findById(bookingId);
            if (!booking) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Booking not found.");
            }
            const currentTime = new Date();
            const pickupTime = new Date(booking.pickupDateTime);
            const cutoffTime = new Date(pickupTime.getTime() - 60 * 60 * 1000);
            if (currentTime >= cutoffTime) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "You can only cancel your booking at least 30 minutes before pickup.");
            }
            const updatedBooking = yield this._bookingRepository.update(bookingId, { status: 'cancelled' });
            if (!updatedBooking) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Cannot cancel your booking..");
            }
            ;
            yield this._carRepository.update(updatedBooking.carId.toString(), { status: "Available" });
            const refundAmount = booking.totalPrice;
            const transactionId = `refund-${booking._id}`;
            yield this._walletRepository.refundToWallet(booking.userId.toString(), refundAmount, transactionId);
            const populatedBooking = yield this._bookingRepository.findById(bookingId, [
                { path: 'userId' },
                { path: 'carId' }
            ]);
            if (!populatedBooking) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Cannot cancel your booking..");
            }
            ;
            return (0, helperFunctions_1.toBookingDTO)(populatedBooking);
        });
    }
    ;
    getBookingById(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = yield this._bookingRepository.getPopulatedBooking(bookingId);
            if (!booking) {
                throw new http_error_1.HttpError(types_2.StatusCode.BAD_REQUEST, "Can't find your bookings");
            }
            ;
            return booking;
        });
    }
    ;
    completeExpiredBookings() {
        return __awaiter(this, void 0, void 0, function* () {
            const completedBookings = yield this._bookingRepository.updateExpiredBookings();
            for (const booking of completedBookings) {
                yield this._carRepository.update(booking.carId.toString(), { status: 'Available' });
            }
            return completedBookings.length;
        });
    }
    getSalesInformation(type, year, month, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalSubsEarnings = yield this._userSubsRepository.getTotalEarnings(type, year, from, to);
            const salesInfo = yield this._bookingRepository.getSalesInformation(type, year, month, from, to);
            const overallTotalEarnings = totalSubsEarnings + (salesInfo.totalCommissionEarnings || 0);
            return Object.assign(Object.assign({}, salesInfo), { totalSubsEarnings,
                overallTotalEarnings });
        });
    }
};
BookingService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.IBookingRepository)),
    __param(1, (0, inversify_1.inject)(types_1.default.IAddressRepository)),
    __param(2, (0, inversify_1.inject)(types_1.default.ICarRepository)),
    __param(3, (0, inversify_1.inject)(types_1.default.IWalletRepository)),
    __param(4, (0, inversify_1.inject)(types_1.default.IUserSubsRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], BookingService);
exports.default = BookingService;
;
