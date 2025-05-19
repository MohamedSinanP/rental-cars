import { inject, injectable } from "inversify";
import IBookingService from "../interfaces/services/booking.service";
import { BasicSalesInfo, BookingDTO, IBooking, IBookingModel, IBookingPopulated } from "../types/booking";
import TYPES from "../di/types";
import IBookingRepository from "../interfaces/repositories/booking.repository";
import { HttpError } from "../utils/http.error";
import { PaginatedData, StatusCode } from "../types/types";
import IAddressRepository from "../interfaces/repositories/address.repository";
import ICarRepository from "../interfaces/repositories/car.repository";
import IWalletRepository from "../interfaces/repositories/wallet.repository";
import { Types } from "mongoose";
import IUserSubsRepository from "../interfaces/repositories/user.subscription.repository";
import { toBookingDTO } from "../utils/helperFunctions";


@injectable()
export default class BookingService implements IBookingService {
  constructor(
    @inject(TYPES.IBookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.IAddressRepository) private _addressRepository: IAddressRepository,
    @inject(TYPES.ICarRepository) private _carRepository: ICarRepository,
    @inject(TYPES.IWalletRepository) private _walletRepository: IWalletRepository,
    @inject(TYPES.IUserSubsRepository) private _userSubsRepository: IUserSubsRepository
  ) { };

  async createBooking(data: IBooking): Promise<BookingDTO> {
    const { userId, carId, userDetails } = data;
    const carObjId = new Types.ObjectId(carId)
    const { name, email, phoneNumber, address } = userDetails;
    const isBooked = await this._carRepository.findOne({ _id: carObjId, status: "Booked" });
    if (isBooked) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Car is already booked for the selected time period");
    };
    const bookedCar = await this._carRepository.findOne({ _id: carObjId }, [{ path: 'ownerId' }]);
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

    let booking: IBookingModel | null;
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
    return toBookingDTO(booking);
  }

  async fetchUserRentals(id: string, page: number, limit: number): Promise<PaginatedData<BookingDTO>> {
    const { data, total } = await this._bookingRepository.findPaginated(id, page, limit);

    if (!data) {
      throw new HttpError(StatusCode.NOT_FOUND, "Can't get the cars.");
    }

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map(toBookingDTO),
      totalPages,
      currentPage: page,
    };
  }


  async getCarBookingsOfOwner(id: string, page: number, limit: number): Promise<PaginatedData<BookingDTO>> {
    const { data, total } = await this._bookingRepository.findAllByOwnerId(id, page, limit);

    if (!data) {
      throw new HttpError(StatusCode.NOT_FOUND, "Can't get the cars.");
    }

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map(toBookingDTO),
      totalPages,
      currentPage: page,
    };
  }

  async changeBookingStatus(
    bookingId: string,
    status: "active" | "cancelled" | "completed"
  ): Promise<BookingDTO> {
    const updatedBooking = await this._bookingRepository.update(bookingId, { status });
    if (!updatedBooking) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't update booking status");
    }

    if (status === "cancelled") {
      const carId = updatedBooking.carId.toString();
      const userId = updatedBooking.userId.toString();
      const refundAmount = updatedBooking.totalPrice;
      const transactionId = `refund-${updatedBooking._id}`;

      await this._carRepository.update(carId, { status: "Available" });

      await this._walletRepository.refundToWallet(userId, refundAmount, transactionId);
    }

    if (status === "completed") {
      await this._carRepository.update(updatedBooking.carId.toString(), {
        status: "Available",
      });
    }

    return toBookingDTO(updatedBooking);
  }

  async getLatestBooking(bookingId: string): Promise<BookingDTO> {
    const latestBooking = await this._bookingRepository.findById(bookingId);
    if (!latestBooking) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't update booking status");
    }
    return toBookingDTO(latestBooking);
  };

  async cancelBooking(bookingId: string): Promise<BookingDTO> {
    const booking = await this._bookingRepository.findById(bookingId);
    if (!booking) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Booking not found.");
    }

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
    return toBookingDTO(populatedBooking);
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