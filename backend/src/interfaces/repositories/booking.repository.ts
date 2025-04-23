import { IBooking, IBookingModel } from "../../types/booking";
import IBaseRepository from "./base.repository";


export default interface IBookingRepository extends IBaseRepository<IBookingModel> {
  bookCar(data: IBooking): Promise<IBookingModel>;
  findAllByUserId(userId: string): Promise<IBookingModel[]>;
  findAllByOwnerId(ownerId: string): Promise<IBookingModel[]>;
  findPaginated(page: number, limit: number): Promise<{ data: IBookingModel[]; total: number }>;

}