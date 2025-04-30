import { IBooking, IBookingModel } from "../../types/booking";
import { PaginatedData } from "../../types/types";

export default interface IBookingService {
  createBooking(data: IBooking): Promise<IBookingModel>;
  fetchUserRentals(id: string, page: number, limit: number): Promise<PaginatedData<IBookingModel>>;
  getCarBookingsOfOwner(id: string, page: number, limit: number): Promise<PaginatedData<IBookingModel>>;
  changeBookingStatus(bookingId: string, status: "active" | "cancelled" | "completed"): Promise<IBookingModel>;
  getLatestBooking(bookingId: string): Promise<IBookingModel>;
}