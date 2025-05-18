import { inject, injectable } from "inversify";
import IBookingService from "../interfaces/services/booking.service";
import { BasicSalesInfo, IBooking, IBookingModel, IBookingPopulated } from "../types/booking";
import TYPES from "../di/types";
import IBookingRepository from "../interfaces/repositories/booking.repository";
import { HttpError } from "../utils/http.error";
import { PaginatedData, StatusCode } from "../types/types";
import IAddressRepository from "../interfaces/repositories/address.repository";
import ICarRepository from "../interfaces/repositories/car.repository";
import IWalletRepository from "../interfaces/repositories/wallet.repository";
import { Types, UpdateResult } from "mongoose";
import IOwnerRepository from "../interfaces/repositories/owner.repository";
import IUserSubsRepository from "../interfaces/repositories/user.subscription.repository";


@injectable()
export default class BookingService implements IBookingService {
  constructor(
    @inject(TYPES.IBookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.IAddressRepository) private _addressRepository: IAddressRepository,
    @inject(TYPES.ICarRepository) private _carRepository: ICarRepository,
    @inject(TYPES.IWalletRepository) private _walletRepository: IWalletRepository,
    @inject(TYPES.IUserSubsRepository) private _userSubsRepository: IUserSubsRepository
  ) { };

  async createBooking(data: IBooking): Promise<IBookingModel> {
    const { userId, carId, pickupDateTime, dropoffDateTime, userDetails } = data;
    const { name, email, phoneNumber, address } = userDetails;
    const isBooked = await this._bookingRepository.isBooked(carId, pickupDateTime, dropoffDateTime);
    if (isBooked) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Car is already booked for the selected time period");
    };
    const bookedCar = await this._carRepository.findOne({ _id: carId }, [{ path: 'ownerId' }]);
    const DEFAULT_COMMISSION_PERCENTAGE = 10;

    let commissionPercentage = DEFAULT_COMMISSION_PERCENTAGE;
    if (bookedCar && 'ownerId' in bookedCar && bookedCar.ownerId && 'commission' in bookedCar.ownerId) {
      commissionPercentage = bookedCar.ownerId.commission;
    }


    const adminCommissionAmount = (data.totalPrice * commissionPercentage) / 100;

    const ownerEarning = data.totalPrice - adminCommissionAmount;

    const bookingData = {
      ...data,
      commissionPercentage,
      adminCommissionAmount,
      ownerEarning
    };

    let booking;
    if (data.paymentMethod === 'wallet') {
      const userObjId = new Types.ObjectId(userId)
      const userWallet = await this._walletRepository.findOne({ userId: userObjId });

      if (!userWallet || userWallet.balance < data.totalPrice) {
        throw new HttpError(StatusCode.BAD_REQUEST, "Insufficient wallet balance");
      }

      await this._walletRepository.refundToWallet(userId, data.totalPrice);
    };

    booking = await this._bookingRepository.bookCar(bookingData);
    await this._carRepository.update(carId, { status: "Booked" });
    const existingAddress = await this._addressRepository.findOne({ name, email, phoneNumber, address });
    if (!existingAddress) {
      await this._addressRepository.addNewAddress({ userId, name, email, phoneNumber, address });
    };
    if (!booking) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't add your booking");
    }
    return booking;
  }

  async fetchUserRentals(id: string, page: number, limit: number): Promise<PaginatedData<IBookingModel>> {
    const { data, total } = await this._bookingRepository.findPaginated(id, page, limit)
      ;
    if (!data) {
      throw new HttpError(StatusCode.NOT_FOUND, "Can't get the cars.")
    };
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      totalPages,
      currentPage: page,
    };
  };


  async getCarBookingsOfOwner(id: string, page: number, limit: number): Promise<PaginatedData<IBookingModel>> {
    const { data, total } = await this._bookingRepository.findAllByOwnerId(id, page, limit);
    if (!data) {
      throw new HttpError(StatusCode.NOT_FOUND, "Can't get the cars.")
    };
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      totalPages,
      currentPage: page,
    };
  };

  async changeBookingStatus(bookingId: string, status: "active" | "cancelled" | "completed"): Promise<IBookingModel> {
    const updatedBooking = await this._bookingRepository.update(bookingId, { status: status });
    if (!updatedBooking) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't update booking status");
    }
    return updatedBooking;
  };

  async getLatestBooking(bookingId: string): Promise<IBookingModel> {
    const latestBooking = await this._bookingRepository.findById(bookingId);
    if (!latestBooking) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't update booking status");
    }
    return latestBooking;
  };

  async cancelBooking(bookingId: string): Promise<IBookingModel> {
    const booking = await this._bookingRepository.findById(bookingId);
    if (!booking) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Booking not found.");
    }

    // Check if pickupDateTime is in the past
    const currentTime = new Date();

    const pickupTime = new Date(booking.pickupDateTime);
    const cutoffTime = new Date(pickupTime.getTime() - 60 * 60 * 1000);

    if (currentTime >= cutoffTime) {
      throw new HttpError(StatusCode.BAD_REQUEST, "You can only cancel your booking at least 30 minutes before pickup.");
    }

    const updatedBooking = await this._bookingRepository.update(bookingId, { status: 'cancelled' });
    if (!updatedBooking) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Cannot cancel your booking..");
    };
    await this._carRepository.update(updatedBooking.carId.toString(), { status: "Available" });

    const refundAmount = booking.totalPrice;
    const transactionId = `refund-${booking._id}`;

    await this._walletRepository.refundToWallet(
      booking.userId.toString(),
      refundAmount,
      transactionId
    );

    const populatedBooking = await this._bookingRepository.findById(bookingId, [
      { path: 'userId' },
      { path: 'carId' }]);
    if (!populatedBooking) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Cannot cancel your booking..");
    };
    return populatedBooking;
  };

  async getBookingById(bookingId: string): Promise<IBookingPopulated> {
    const booking = await this._bookingRepository.getPopulatedBooking(bookingId);
    if (!booking) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find your bookings");
    };
    return booking;
  };

  async completeExpiredBookings(): Promise<number> {
    const completedBookings = await this._bookingRepository.updateExpiredBookings();

    for (const booking of completedBookings) {
      await this._carRepository.update(booking.carId.toString(), { status: 'Available' });
    }
    return completedBookings.length;
  }

  async getSalesInformation(
    type: 'yearly' | 'monthly' | 'custom',
    year: number,
    month: number,
    from: string,
    to: string
  ): Promise<BasicSalesInfo & { totalSubsEarnings: number; overallTotalEarnings: number }> {
    const totalSubsEarnings = await this._userSubsRepository.getTotalEarnings(type, year, from, to);

    const salesInfo = await this._bookingRepository.getSalesInformation(type, year, month, from, to);

    const overallTotalEarnings = totalSubsEarnings + (salesInfo.totalCommissionEarnings || 0);

    return {
      ...salesInfo,
      totalSubsEarnings,
      overallTotalEarnings
    };
  }
};