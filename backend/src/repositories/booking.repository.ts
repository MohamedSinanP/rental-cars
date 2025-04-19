import { Model } from "mongoose";
import { IBooking, IBookingModel } from "../types/booking";
import { BaseRepository } from "./base.repository";
import TYPES from "../di/types";
import { inject, injectable } from "inversify";
import IBookingRepository from "../interfaces/booking.repository";

@injectable()
export class BookingRepository extends BaseRepository<IBookingModel> implements IBookingRepository {
  constructor(@inject(TYPES.BookingModel) private bookingModel: Model<IBookingModel>) {
    super(bookingModel);
  };

  async bookCar(data: IBooking): Promise<IBookingModel> {
    return await this.bookingModel.create(data);
  };

  async findAllByUserId(userId: string): Promise<IBookingModel[]> {
    return await this.bookingModel.find({ userId })
      .populate('userId')
      .populate('carId');
  };
};