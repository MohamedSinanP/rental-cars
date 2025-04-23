import { inject, injectable } from "inversify";
import IBookingService from "../interfaces/services/booking.service";
import { IBooking, IBookingModel } from "../types/booking";
import TYPES from "../di/types";
import IBookingRepository from "../interfaces/repositories/booking.repository";
import { HttpError } from "../utils/http.error";
import { PaginatedData } from "../types/types";



@injectable()
export default class BookingService implements IBookingService {
  constructor(@inject(TYPES.IBookingRepository) private bookingRepository: IBookingRepository) { };

  async createBooking(data: IBooking): Promise<IBookingModel> {
    const booking = await this.bookingRepository.bookCar(data);
    if (!booking) {
      throw new HttpError(400, "Can't add your booking ");
    };
    return booking;
  };

  async fetchUserRentals(id: string, page: number, limit: number): Promise<PaginatedData<IBookingModel>> {
    const { data, total } = await this.bookingRepository.findPaginated(page, limit)
      ;
    if (!data) {
      throw new HttpError(404, "Can't get the cars.")
    };
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      totalPages,
      currentPage: page,
    };
  };


  async getCarBookingsOfOwner(id: string): Promise<IBookingModel[]> {
    const rentals = await this.bookingRepository.findAllByOwnerId(id);
    return rentals;
  };

  async changeBookingStatus(bookingId: string, status: "active" | "cancelled" | "completed"): Promise<IBookingModel> {
    const updatedBooking = await this.bookingRepository.update(bookingId, { status: status });
    if (!updatedBooking) {
      throw new HttpError(400, "Can't update booking status");
    }
    return updatedBooking;
  };
  async getLatestBooking(bookingId: string): Promise<IBookingModel> {
    const latestBooking = await this.bookingRepository.findById(bookingId);
    if (!latestBooking) {
      throw new HttpError(400, "Can't update booking status");
    }
    return latestBooking;
  };

};