import { FilterQuery } from "mongoose";
import { IBooking, IBookingModel } from "../../types/booking";
import IBaseRepository from "./base.repository";


export default interface IBookingRepository extends IBaseRepository<IBookingModel> {
  bookCar(data: IBooking): Promise<IBookingModel>;
  findOne(query: FilterQuery<IBookingModel>): Promise<IBookingModel | null>;
  findAllByUserId(userId: string): Promise<IBookingModel[]>;
  findAllByOwnerId(ownerId: string, page: number, limit: number): Promise<{ data: IBookingModel[]; total: number; }>;
  findPaginated(page: number, limit: number): Promise<{ data: IBookingModel[]; total: number }>;
  isBooked(carId: string, pickupDateTime: Date, dropoffDateTime: Date): Promise<IBookingModel | null>;
}