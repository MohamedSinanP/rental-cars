import { Request, Response, NextFunction } from "express";

export default interface IPaymentController {
  createPaymentIntent(req: Request, res: Response, next: NextFunction): Promise<void>;
};