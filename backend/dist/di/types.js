"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TYPES = {
    // controllers
    IAuthController: Symbol.for("IAuthController"),
    ICarController: Symbol.for("ICarController"),
    IUserConroller: Symbol.for("IUserConroller"),
    IPaymentController: Symbol.for("IPaymentController"),
    IBookingController: Symbol.for("IBookingController"),
    IAdminController: Symbol.for("IAdminController"),
    ISubscriptionController: Symbol.for("ISubscriptionController"),
    // repositories
    IUserRepository: Symbol.for("IUserRepository"),
    IOwnerRepository: Symbol.for("IOwnerRepository"),
    ICarRepository: Symbol.for("ICarRepository"),
    IBookingRepository: Symbol.for("IBookingRepository"),
    IAdminRepository: Symbol.for("IAdminRepository"),
    ISubscriptionRepository: Symbol.for("ISubscriptionRepository"),
    IUserSubsRepository: Symbol.for("IUserSubsRepository"),
    // services 
    IAuthService: Symbol.for("IAuthService"),
    IOtpService: Symbol.for("IOtpService"),
    IJwtService: Symbol.for("IJwtService"),
    ICarService: Symbol.for("ICarService"),
    IUserService: Symbol.for("IUserService"),
    IPaymentService: Symbol.for("IPaymentService"),
    IBookingService: Symbol.for("IBookingService"),
    IOwnerService: Symbol.for("IOwnerService"),
    ISubscriptionService: Symbol.for("ISubscriptionService"),
    // models
    UserModel: Symbol.for("UserModel"),
    OwnerModel: Symbol.for("OwnerModel"),
    CarModel: Symbol.for("CarModel"),
    BookingModel: Symbol.for("BookingModel"),
    AdminModel: Symbol.for("AdminModel"),
    SubscriptionModel: Symbol.for("SubscriptionModel"),
    UserSubsModel: Symbol.for("UserSubsModel"),
};
exports.default = TYPES;
//# sourceMappingURL=types.js.map