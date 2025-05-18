import { BasicSalesInfo, BookingDTO, IBooking, IBookingModel, IBookingPopulated } from "../../types/booking";
import { PaginatedData } from "../../types/types";

export default interface IBookingService {
  createBooking(data: IBooking): Promise<BookingDTO>;
  fetchUserRentals(id: string, page: number, limit: number): Promise<PaginatedData<BookingDTO>>;
  getCarBookingsOfOwner(id: string, page: number, limit: number): Promise<PaginatedData<BookingDTO>>;
  changeBookingStatus(bookingId: string, status: "active" | "cancelled" | "completed"): Promise<BookingDTO>;
  getLatestBooking(bookingId: string): Promise<BookingDTO>;
  cancelBooking(bookingId: string): Promise<BookingDTO>;
  getBookingById(bookingId: string): Promise<IBookingPopulated>;
  completeExpiredBookings(): Promise<number>;
  getSalesInformation(type: 'yearly' | 'monthly' | 'custom', year: number, month: number | undefined, from: string, to: string): Promise<BasicSalesInfo & { totalSubsEarnings: number; overallTotalEarnings: number }>;
}