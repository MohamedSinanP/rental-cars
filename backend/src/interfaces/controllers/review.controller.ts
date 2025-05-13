import { Request, Response, NextFunction } from "express";

export default interface IReviewController {
  addReview(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllCarReview(req: Request, res: Response, next: NextFunction): Promise<void>;
};