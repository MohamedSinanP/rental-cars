import { IBookingModel, RentalStatsForAdmin, RentalStatsForOwner } from "../../types/booking";
import { IAdminDashboardData, IOwnerDashboardData, PaginatedData } from "../../types/types";

export default interface IDashboardService {
  getStatsForAdmin(): Promise<IAdminDashboardData>;
  getRentalStatsForAdmin(type: string, year: number, from: string, to: string): Promise<RentalStatsForAdmin[]>;
  getStatsForOwner(ownerId: string): Promise<IOwnerDashboardData>;
  getRentalStatsForOwner(ownerId: string, type: string, year: number, from: string, to: string): Promise<RentalStatsForOwner[]>;
  getAllRentalsForAdmin(page: number, limit: number, type: string, year: number, from: string, to: string): Promise<PaginatedData<IBookingModel>>;
};