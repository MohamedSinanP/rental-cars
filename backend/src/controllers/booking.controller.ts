import { inject, injectable } from "inversify";
import TYPES from "../di/types";
import IBookingService from "../interfaces/services/booking.service";
import IBookingController from "../interfaces/controllers/booking.controller";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { IBooking } from "../types/booking";
import { HttpResponse } from "../utils/http.response";
import { stat } from "fs";
import { StatusCode } from "../types/types";



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
        ownerId: req.body.ownerId,
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
      res.status(StatusCode.CREATED).json(HttpResponse.created(booking, "Your Booking confirmed"));
    } catch (error) {
      next(error);
    };
  };

  async fetchUserRentals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 4;
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId!;
      const userRentals = await this.bookingService.fetchUserRentals(userId, page, limit);
      console.log(userRentals);
      res.status(StatusCode.OK).json(HttpResponse.success(userRentals));
    } catch (error) {
      next(error);
    };
  };

  async fetchOwnerAllBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId!;
      const userRentals = await this.bookingService.getCarBookingsOfOwner(userId, page, limit);
      res.status(StatusCode.OK).json(HttpResponse.success(userRentals));
    } catch (error) {
      next(error);
    };
  };

  async changeBookingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingId = req.params.id;
      const { status } = req.body;
      const updatedBooking = await this.bookingService.changeBookingStatus(bookingId, status);
      res.status(StatusCode.OK).json(HttpResponse.success(updatedBooking));
    } catch (error) {
      next(error);
    };
  };

  async getLatestBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingId = req.params.id;
      const latestBooking = await this.bookingService.getLatestBooking(bookingId);
      res.status(StatusCode.OK).json(HttpResponse.success(latestBooking));
    } catch (error) {
      next(error)
    };
  };
};