import { Container } from "inversify"
import IUserRepository from "../interfaces/user.repository"
import UserRepository from "../repositories/user.repository"
import TYPES from "./types";
import { User } from "../models/user.model";
import AuthService from "../services/auth.service";
import IAuthService from "../interfaces/auth.service";
import AuthController from "../controllers/auth.controller";
import { IOtpService, OtpSerivce } from "../utils/mail";
import { IJwtService, JwtService } from "../utils/jwt";
import IOwnerRepository from "../interfaces/owner.repository";
import OwnerRepository from "../repositories/owner.repository";
import { Owner } from "../models/owner.model";
import { Car } from "../models/car.model";
import ICarRepository from "../interfaces/car.repository";
import { CarRepository } from "../repositories/car.repository";
import ICarService from "../interfaces/car.service";
import CarService from "../services/car.service";
import CarController from "../controllers/car.controller";
import IUserService from "../interfaces/user.service";
import UserService from "../services/user.service";
import UserConroller from "../controllers/user.controller";
import IPaymentService from "../interfaces/payment.service";
import PaymentService from "../services/payment.service";
import PaymentController from "../controllers/payment.controller";
import Booking from "../models/booking.model";
import BookingController from "../controllers/booking.controller";
import IBookingRepository from "../interfaces/booking.repository";
import { BookingRepository } from "../repositories/booking.repository";
import BookingService from "../services/booking.service";
import IBookingService from "../interfaces/booking.service";


const container = new Container();

// controllers
container.bind<AuthController>(TYPES.IAuthController).to(AuthController).inSingletonScope();
container.bind<CarController>(TYPES.ICarController).to(CarController).inSingletonScope();
container.bind<UserConroller>(TYPES.IUserConroller).to(UserConroller).inSingletonScope();
container.bind<PaymentController>(TYPES.IPaymentController).to(PaymentController).inSingletonScope();
container.bind<BookingController>(TYPES.IBookingController).to(BookingController).inSingletonScope();


// repositories
container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository).inSingletonScope();
container.bind<IOwnerRepository>(TYPES.IOwnerRepository).to(OwnerRepository).inSingletonScope();
container.bind<ICarRepository>(TYPES.ICarRepository).to(CarRepository).inSingletonScope();
container.bind<IBookingRepository>(TYPES.IBookingRepository).to(BookingRepository).inSingletonScope();


// services
container.bind<IAuthService>(TYPES.IAuthService).to(AuthService).inSingletonScope();
container.bind<IOtpService>(TYPES.IOtpService).to(OtpSerivce).inSingletonScope();
container.bind<IJwtService>(TYPES.IJwtService).to(JwtService).inSingletonScope();
container.bind<ICarService>(TYPES.ICarService).to(CarService).inSingletonScope();
container.bind<IUserService>(TYPES.IUserService).to(UserService).inSingletonScope();
container.bind<IPaymentService>(TYPES.IPaymentService).to(PaymentService).inSingletonScope();
container.bind<IBookingService>(TYPES.IBookingService).to(BookingService).inSingletonScope();



// models
container.bind<typeof User>(TYPES.UserModel).toConstantValue(User);
container.bind<typeof Owner>(TYPES.OwnerModel).toConstantValue(Owner);
container.bind<typeof Car>(TYPES.CarModel).toConstantValue(Car);
container.bind<typeof Booking>(TYPES.BookingModel).toConstantValue(Booking);


export const authController = container.get<AuthController>(TYPES.IAuthController);
export const carController = container.get<CarController>(TYPES.ICarController);
export const userController = container.get<UserConroller>(TYPES.IUserConroller);
export const paymentController = container.get<PaymentController>(TYPES.IPaymentController);
export const bookingController = container.get<BookingController>(TYPES.IBookingController);