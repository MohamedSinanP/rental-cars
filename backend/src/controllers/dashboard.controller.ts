import { Request, Response, NextFunction } from "express";
import IDashboardController from "../interfaces/controllers/dashboard.controller";
import { inject, injectable } from "inversify";
import TYPES from "../di/types";
import IDashboardService from "../interfaces/services/dashboard.service";
import { HttpResponse } from "../utils/http.response";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { StatusCode } from "../types/types";

@injectable()
export default class DashboardController implements IDashboardController {
  constructor(@inject(TYPES.IDashboardService) private _dashboardService: IDashboardService) { }

  async getStatsForAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this._dashboardService.getStatsForAdmin();
      res.status(200).json(HttpResponse.success(stats));
    } catch (error) {
      next(error);
    };
  };

  async getRentalStatsForAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, year, from, to } = req.query;
      const validType = typeof type === 'string' ? type : 'monthly';

      const validYear = year ? Number(year) : new Date().getFullYear();

      const validFrom = typeof from === 'string' ? from : '';
      const validTo = typeof to === 'string' ? to : '';
      const rentalStats = await this._dashboardService.getRentalStatsForAdmin(validType, validYear, validFrom, validTo);
      res.status(StatusCode.OK).json(HttpResponse.success(rentalStats));
    } catch (error) {
      next(error);
    };
  };

  async getStatsForOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const ownerId = user?.userId!;
      const stats = await this._dashboardService.getStatsForOwner(ownerId);
      res.status(StatusCode.OK).json(HttpResponse.success(stats));
    } catch (error) {
      next(error);
    };
  };

  async getRentalStatsForOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const ownerId = user?.userId!;
      const { type, year, from, to } = req.query;
      const validType = typeof type === 'string' ? type : 'monthly';

      const validYear = year ? Number(year) : new Date().getFullYear();

      const validFrom = typeof from === 'string' ? from : '';
      const validTo = typeof to === 'string' ? to : '';
      const stats = await this._dashboardService.getRentalStatsForOwner(ownerId, validType, validYear, validFrom, validTo);

      res.status(StatusCode.OK).json(HttpResponse.success(stats));
    } catch (error) {
      next(error);
    };
  };

  async getAllBookingsForAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      const { type, year, from, to } = req.query;
      const validType = typeof type === 'string' ? type : 'monthly';

      const validYear = year ? Number(year) : new Date().getFullYear();

      const validFrom = typeof from === 'string' ? from : '';
      const validTo = typeof to === 'string' ? to : '';
      const bookings = await this._dashboardService.getAllRentalsForAdmin(page, limit, validType, validYear, validFrom, validTo);

      res.status(StatusCode.OK).json(HttpResponse.success(bookings));
    } catch (error) {
      next(error);
    };
  };
};