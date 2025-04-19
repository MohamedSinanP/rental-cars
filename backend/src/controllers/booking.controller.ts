import { inject, injectable } from "inversify";
import TYPES from "../di/types";
import IBookingService from "../interfaces/booking.service";
import IBookingController from "../interfaces/booking.controller";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { IBooking } from "../types/booking";
import { HttpResponse } from "../utils/http.response";



@injectable()
export default class BookingController implements IBookingController {
  constructor(@inject(TYPES.IBookingService) private bookingService: IBookingService) { };

  async creatBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId!;
      const bookingData: IBooking = {
        userId: userId,
        carId: req.body.carId,
        userDetails: req.body.userDetails,
        pickupLocation: req.body.pickupLocation,
        dropoffLocation: req.body.dropoffLocation,
        pickupDateTime: req.body.pickupDateTime,
        dropoffDateTime: req.body.dropoffDateTime,
        totalPrice: req.body.totalPrice,
        paymentStatus: 'completed',
        paymentMethod: req.body.paymentMethod,
        paymentId: req.body.paymentId,
        status: 'active',
      };
      const booking = await this.bookingService.createBooking(bookingData);
      res.status(201).json(HttpResponse.created(booking, "Your Booking confirmed"));
    } catch (error) {
      next(error);
    };
  };

  async fetchUserRentals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId!;
      const userRentals = await this.bookingService.fetchUserRentals(userId);
      res.status(200).json(HttpResponse.success(userRentals));
    } catch (error) {
      next(error);
    };
  };
};