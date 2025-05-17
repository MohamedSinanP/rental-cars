import { NextFunction, Request, Response } from "express";

export default interface IWishlistController {
  addToWishlist(req: Request, res: Response, next: NextFunction): Promise<void>;
  removeFromWishlist(req: Request, res: Response, next: NextFunction): Promise<void>;
  getWishlist(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUserWishlist(req: Request, res: Response, next: NextFunction): Promise<void>;
}