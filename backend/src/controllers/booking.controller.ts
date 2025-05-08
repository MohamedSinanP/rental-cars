import { inject, injectable } from "inversify";
import TYPES from "../di/types";
import IBookingService from "../interfaces/services/booking.service";
import IBookingController from "../interfaces/controllers/booking.controller";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { IBooking, IBookingPopulated } from "../types/booking";
import { HttpResponse } from "../utils/http.response";
import { stat } from "fs";
import { StatusCode } from "../types/types";
import { generateInvoicePDF } from "../utils/invoiceGenerator";



@injectable()
export default class BookingController implements IBookingController {
  constructor(@inject(TYPES.IBookingService) private _bookingService: IBookingService) { };

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
      const booking = await this._bookingService.createBooking(bookingData);
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
      const userRentals = await this._bookingService.fetchUserRentals(userId, page, limit);
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
      const userRentals = await this._bookingService.getCarBookingsOfOwner(userId, page, limit);
      res.status(StatusCode.OK).json(HttpResponse.success(userRentals));
    } catch (error) {
      next(error);
    };
  };

  async changeBookingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingId = req.params.id;
      const { status } = req.body;
      const updatedBooking = await this._bookingService.changeBookingStatus(bookingId, status);
      res.status(StatusCode.OK).json(HttpResponse.success(updatedBooking));
    } catch (error) {
      next(error);
    };
  };

  async getLatestBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingId = req.params.id;
      const latestBooking = await this._bookingService.getLatestBooking(bookingId);
      res.status(StatusCode.OK).json(HttpResponse.success(latestBooking));
    } catch (error) {
      next(error)
    };
  };

  async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingId = req.params.id;
      const updatedBooking = await this._bookingService.cancelBooking(bookingId);
      res.status(StatusCode.OK).json(HttpResponse.success(updatedBooking));
    } catch (error) {
      next(error)
    };
  };


  async invoiceForUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingId = req.params.id;
      const booking = await this._bookingService.getBookingById(bookingId);
      await generateInvoicePDF(res, booking);
    } catch (error) {
      next(error);
    };
  };

  async getSalesReportPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, year, from, to } = req.query;
      const validType = typeof type === 'string' ? type : 'monthly';

      const validYear = year ? Number(year) : new Date().getFullYear();

      const validFrom = typeof from === 'string' ? from : '';
      const validTo = typeof to === 'string' ? to : '';
      const sales = await this._bookingService.getSalesInformation(validType, validYear, validFrom, validTo);
    } catch (error) {
      next(error);
    }
  }
};