import { FilterQuery, Model, Types } from "mongoose";
import { IBooking, IBookingModel } from "../types/booking";
import { BaseRepository } from "./base.repository";
import TYPES from "../di/types";
import { inject, injectable } from "inversify";
import IBookingRepository from "../interfaces/repositories/booking.repository";

@injectable()
export class BookingRepository extends BaseRepository<IBookingModel> implements IBookingRepository {
  constructor(@inject(TYPES.BookingModel) private bookingModel: Model<IBookingModel>) {
    super(bookingModel);
  };

  async bookCar(data: IBooking): Promise<IBookingModel> {
    return await this.bookingModel.create(data);
  };
  async findOne(query: FilterQuery<IBookingModel>): Promise<IBookingModel | null> {
    return this.bookingModel.findOne(query).exec();
  }
  async findAllByUserId(userId: string): Promise<IBookingModel[]> {
    return await this.bookingModel.find({ userId })
      .populate('userId')
      .populate('carId');
  };
  async findAllByOwnerId(ownerId: string, page: number, limit: number): Promise<{ data: IBookingModel[]; total: number; }> {
    const skip = (page - 1) * limit;
    const data = await this.bookingModel.find({ ownerId })
      .populate('carId')
      .populate('ownerId')
      .populate('userId')
      .skip(skip).limit(limit);

    const total = await this.bookingModel.countDocuments();
    return { data, total };
  };

  async findPaginated(page: number, limit: number): Promise<{ data: IBookingModel[]; total: number; }> {
    const skip = (page - 1) * limit;
    const data = await this.bookingModel.find()
      .populate('carId')
      .populate('ownerId')
      .populate('userId')
      .skip(skip).limit(limit);
    const total = await this.bookingModel.countDocuments();
    return { data, total };
  };

  async isBooked(carId: string, pickupDateTime: Date, dropoffDateTime: Date): Promise<IBookingModel | null> {
    const carObjId = new Types.ObjectId(carId)

    const isBooked = await this.bookingModel.findOne({
      carId: carObjId,
      $or: [
        {
          pickupDateTime: { $lte: dropoffDateTime },
          dropoffDateTime: { $gte: pickupDateTime },
        },
        {
          pickupDateTime: { $gte: pickupDateTime, $lte: dropoffDateTime },
        },
      ],
    });

    return isBooked;
  }
};