import { Request, Response, NextFunction } from "express";
import IPaymentController from "../interfaces/controllers/payment.contoller";
import { inject, injectable } from "inversify";
import TYPES from "../di/types";
import IPaymentService from "../interfaces/services/payment.service";
import { HttpResponse } from "../utils/http.response";
import { StatusCode } from "../types/types";

@injectable()
export default class PaymentController implements IPaymentController {
  constructor(@inject(TYPES.IPaymentService) private _paymentService: IPaymentService) { };

  async createPaymentIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount } = req.body;
      const { clientSecret, paymentId } = await this._paymentService.createPaymentIntentService(amount);
      res.status(StatusCode.OK).json(HttpResponse.success({ clientSecret, paymentId }));
    } catch (error) {
      next(error);
    };
  };

};