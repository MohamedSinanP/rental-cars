import { Request, Response, NextFunction } from "express";
import IWishlistController from "../interfaces/controllers/wishlist.controller";
import TYPES from "../di/types";
import IWishlistService from "../interfaces/services/wishlist.service";
import { inject, injectable } from "inversify";
import { StatusCode } from "../types/types";
import { HttpResponse } from "../utils/http.response";
import { HttpError } from "../utils/http.error";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

@injectable()
export default class WishlistController implements IWishlistController {
  constructor(@inject(TYPES.IWishlistService) private _wishlistService: IWishlistService) {

  }
  async addToWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId!;
      const { carId } = req.body;

      if (!userId || !carId) {
        throw new HttpError(StatusCode.BAD_REQUEST, "User id and Car ID are required");
      }

      const wishlist = await this._wishlistService.addToWishlist(userId, carId);

      res.status(StatusCode.OK).json(HttpResponse.success(wishlist));
    } catch (error) {
      next(error);
    }
  };

  async removeFromWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId!;
      const carId = req.params.id;

      if (!userId || !carId) {
        throw new HttpError(StatusCode.BAD_REQUEST, "User ID and Car ID are required");
      }

      const wishlist = await this._wishlistService.removeFromWishlist(userId, carId);

      res.status(StatusCode.OK).json(HttpResponse.success(wishlist));
    } catch (error) {
      next(error);
    }
  };

  async getWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId!;
      if (!userId) {
        throw new HttpError(StatusCode.BAD_REQUEST, "User ID is required");
      }

      const wishlist = await this._wishlistService.getWishlist(userId);

      res.status(StatusCode.OK).json(HttpResponse.success(wishlist));
    } catch (error) {
      next(error);
    }
  };

  async getUserWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      const userWishlist = await this._wishlistService.getUserWishlist(userId, page, limit);
      res.status(StatusCode.OK).json(HttpResponse.success(userWishlist));
    } catch (error) {
      next(error);
    }
  }
}