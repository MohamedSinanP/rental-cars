import { inject, injectable } from "inversify";
import IBookingService from "../interfaces/services/booking.service";
import { IBooking, IBookingModel } from "../types/booking";
import TYPES from "../di/types";
import IBookingRepository from "../interfaces/repositories/booking.repository";
import { HttpError } from "../utils/http.error";
import { PaginatedData, StatusCode } from "../types/types";
import IAddressRepository from "../interfaces/repositories/address.repository";


@injectable()
export default class BookingService implements IBookingService {
  constructor(
    @inject(TYPES.IBookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.IAddressRepository) private _addressRepository: IAddressRepository
  ) { };

  async createBooking(data: IBooking): Promise<IBookingModel> {
    const { userId, carId, pickupDateTime, dropoffDateTime, userDetails } = data;
    const { name, email, phoneNumber, address } = userDetails;
    const isBooked = await this._bookingRepository.isBooked(carId, pickupDateTime, dropoffDateTime);
    if (isBooked) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Car is already booked for the selected time period");
    }
    const booking = await this._bookingRepository.bookCar(data);
    await this._addressRepository.addNewAddress({ userId, name, email, phoneNumber, address });
    if (!booking) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't add your booking");
    }
    return booking;
  }

  async fetchUserRentals(id: string, page: number, limit: number): Promise<PaginatedData<IBookingModel>> {
    const { data, total } = await this._bookingRepository.findPaginated(page, limit)
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

};