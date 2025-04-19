import { IBooking, IBookingModel } from "../types/booking";
import IBaseRepository from "./base.repository";


export default interface IBookingRepository extends IBaseRepository<IBookingModel> {
  bookCar(data: IBooking): Promise<IBookingModel>;
  findAllByUserId(userId: string): Promise<IBookingModel[]>;
}