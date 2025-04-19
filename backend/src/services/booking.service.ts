import { inject, injectable } from "inversify";
import IBookingService from "../interfaces/booking.service";
import { IBooking, IBookingModel } from "../types/booking";
import TYPES from "../di/types";
import IBookingRepository from "../interfaces/booking.repository";
import { HttpError } from "../utils/http.error";



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

  async fetchUserRentals(id: string): Promise<IBookingModel[]> {
    const rentals = await this.bookingRepository.findAllByUserId(id);
    return rentals;
  };
};