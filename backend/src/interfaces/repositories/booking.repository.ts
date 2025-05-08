import { FilterQuery, UpdateResult } from "mongoose";
import { IBooking, IBookingModel, IBookingPopulated, RentalStatsForAdmin, RentalStatsForOwner } from "../../types/booking";
import IBaseRepository from "./base.repository";


export default interface IBookingRepository extends IBaseRepository<IBookingModel> {
  bookCar(data: IBooking): Promise<IBookingModel>;
  findOne(query: FilterQuery<IBookingModel>): Promise<IBookingModel | null>;
  findAllByUserId(userId: string): Promise<IBookingModel[]>;
  findAllByOwnerId(ownerId: string, page: number, limit: number): Promise<{ data: IBookingModel[]; total: number; }>;
  findPaginated(page: number, limit: number): Promise<{ data: IBookingModel[]; total: number }>;
  isBooked(carId: string, pickupDateTime: Date, dropoffDateTime: Date): Promise<IBookingModel | null>;
  getTotalAdminEarnings(): Promise<number>;
  getRentalStatsForAdmin(type: string, year: number, from: string, to: string): Promise<RentalStatsForAdmin[]>;
  getRentalStatsForOwner(ownerId: string, type: string, year: number, from: string, to: string): Promise<RentalStatsForOwner[]>;
  getTotalOwnerEarnings(): Promise<number>;
  bookingCountOfOwnerCars(ownerId: string): Promise<number>;
  getTotalAdminCommissionForOwner(ownerId: string): Promise<number>;
  getPopulatedBooking(bookingId: string): Promise<IBookingPopulated | null>;
  updateExpiredBookings(): Promise<UpdateResult>;
  getTotalBookingCount(): Promise<number>;
  getAllRentalsForAdmin(page: number, limit: number, type: string, year: number, from: string, to: string): Promise<{ data: IBookingModel[]; total: number; }>;
  getSalesInformation(type: string, year: number, from: string, to: string): Promise<{ data: IBookingModel[]; total: number; }>;
};