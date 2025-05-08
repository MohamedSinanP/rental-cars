import { inject, injectable } from "inversify";
import IDashboardService from "../interfaces/services/dashboard.service";
import TYPES from "../di/types";
import IUserRepository from "../interfaces/repositories/user.repository";
import IOwnerRepository from "../interfaces/repositories/owner.repository";
import IBookingRepository from "../interfaces/repositories/booking.repository";
import { IAdminDashboardData, IOwnerDashboardData, PaginatedData, StatusCode } from "../types/types";
import IUserSubsRepository from "../interfaces/repositories/user.subscription.repository";
import { IBookingModel, RentalStatsForAdmin, RentalStatsForOwner } from "../types/booking";
import { HttpError } from "../utils/http.error";
import ICarRepository from "../interfaces/repositories/car.repository";

@injectable()
export default class DashboardService implements IDashboardService {
  constructor(
    @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.IOwnerRepository) private _ownerRepository: IOwnerRepository,
    @inject(TYPES.IBookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.IUserSubsRepository) private _userSubsRepository: IUserSubsRepository,
    @inject(TYPES.ICarRepository) private _carRepository: ICarRepository,

  ) { };

  async getStatsForAdmin(): Promise<IAdminDashboardData> {
    const totalUsers = await this._userRepository.countUsers();
    const totalOwners = await this._ownerRepository.countOwners();
    const commisionEarnings = await this._bookingRepository.getTotalAdminEarnings();
    const subscriptionEarnings = await this._userSubsRepository.getTotalSubscriptionEarnings();
    const totalBookings = await this._bookingRepository.getTotalBookingCount();
    const totalEarnings = commisionEarnings + subscriptionEarnings;
    return {
      totalUsers,
      totalOwners,
      subscriptionEarnings,
      totalEarnings,
      totalCommission: commisionEarnings,
      totalBookings
    };
  };

  async getRentalStatsForAdmin(type: string, year: number, from: string, to: string): Promise<RentalStatsForAdmin[]> {
    const retnalStats = await this._bookingRepository.getRentalStatsForAdmin(type, year, from, to);
    if (!retnalStats) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find booking stats");
    };
    return retnalStats;
  };

  async getStatsForOwner(ownerId: string): Promise<IOwnerDashboardData> {
    const totalEarnings = await this._bookingRepository.getTotalOwnerEarnings();
    const totalCars = await this._carRepository.countCars(ownerId)
    const totalBookings = await this._bookingRepository.bookingCountOfOwnerCars(ownerId)
    const platformCommission = await this._bookingRepository.getTotalAdminCommissionForOwner(ownerId);

    return {
      totalEarnings,
      totalCars,
      totalBookings,
      platformCommission
    }
  }

  async getRentalStatsForOwner(ownerId: string, type: string, year: number, from: string, to: string): Promise<RentalStatsForOwner[]> {
    const retnalStats = await this._bookingRepository.getRentalStatsForOwner(ownerId, type, year, from, to);
    if (!retnalStats) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find booking stats");
    };
    return retnalStats;
  };

  async getAllRentalsForAdmin(page: number, limit: number, type: string, year: number, from: string, to: string): Promise<PaginatedData<IBookingModel>> {
    const { data, total } = await this._bookingRepository.getAllRentalsForAdmin(page, limit, type, year, from, to);
    if (!data) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Bookings not found");
    };
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      totalPages,
      currentPage: page
    };
  }
};