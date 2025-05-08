import { Request, Response, NextFunction } from "express";

export default interface IDashboardController {
  getStatsForAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
  getRentalStatsForAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
  getStatsForOwner(req: Request, res: Response, next: NextFunction): Promise<void>;
  getRentalStatsForOwner(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllBookingsForAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
}