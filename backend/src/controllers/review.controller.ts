import { inject, injectable } from "inversify";
import IReviewController from "../interfaces/controllers/review.controller";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import TYPES from "../di/types";
import IReviewService from "../interfaces/services/review.service";
import { StatusCode } from "../types/types";
import { HttpResponse } from "../utils/http.response";

@injectable()
export default class ReviewController implements IReviewController {
  constructor(@inject(TYPES.IReviewService) private _reviewService: IReviewService) { }
  async addReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId!;
      const carId = req.params.id;
      const { rating, comment } = req.body;
      const newReview = await this._reviewService.addReview(userId, carId, rating, comment);
      res.status(StatusCode.CREATED).json(HttpResponse.created(newReview));
    } catch (error) {
      next(error);
    }
  }

  async getAllCarReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const carId = req.params.id;
      const reviews = await this._reviewService.getAllCarReviews(carId);
      res.status(StatusCode.OK).json(HttpResponse.success(reviews));
    } catch (error) {
      next(error);
    }
  }
}