import { NextFunction, Request, Response } from "express";


export default interface IBookingController {
  creatBooking(req: Request, res: Response, next: NextFunction): Promise<void>;
  fetchUserRentals(req: Request, res: Response, next: NextFunction): Promise<void>;
};