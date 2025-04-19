const TYPES = {

  // controllers
  IAuthController: Symbol.for("IAuthController"),
  ICarController: Symbol.for("ICarController"),
  IUserConroller: Symbol.for("IUserConroller"),
  IPaymentController: Symbol.for("IPaymentController"),
  IBookingController: Symbol.for("IBookingController"),

  // repositories
  IUserRepository: Symbol.for("IUserRepository"),
  IOwnerRepository: Symbol.for("IOwnerRepository"),
  ICarRepository: Symbol.for("ICarRepository"),
  IBookingRepository: Symbol.for("IBookingRepository"),


  // services 
  IAuthService: Symbol.for("IAuthService"),
  IOtpService: Symbol.for("IOtpService"),
  IJwtService: Symbol.for("IJwtService"),
  ICarService: Symbol.for("ICarService"),
  IUserService: Symbol.for("IUserService"),
  IPaymentService: Symbol.for("IPaymentService"),
  IBookingService: Symbol.for("IBookingService"),

  // models
  UserModel: Symbol.for("UserModel"),
  OwnerModel: Symbol.for("OwnerModel"),
  CarModel: Symbol.for("CarModel"),
  BookingModel: Symbol.for("BookingModel"),
}

export default TYPES;