import { IBooking, IBookingModel } from "../types/booking";

export default interface IBookingService {
  createBooking(data: IBooking): Promise<IBookingModel>;
  fetchUserRentals(id: string): Promise<IBookingModel[]>;
}