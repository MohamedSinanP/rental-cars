import { inject, injectable } from "inversify";
import IWishlistService from "../interfaces/services/wishlist.service";
import TYPES from "../di/types";
import IWishlitRepository from "../interfaces/repositories/wishlist.repository";
import { IUserWishlistPaginatedResponse, IWishlistModel } from "../types/user";
import { HttpError } from "../utils/http.error";
import { StatusCode } from "../types/types";


@injectable()
export default class WishlistService implements IWishlistService {
  constructor(@inject(TYPES.IWishlistRepository) private _wishlistRepository: IWishlitRepository) { }

  async addToWishlist(userId: string, carId: string): Promise<IWishlistModel> {
    const wishlist = await this._wishlistRepository.addCarToWishlist(userId, carId);
    if (!wishlist) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't add to wishlist.");
    }
    return wishlist;
  };

  async removeFromWishlist(userId: string, carId: string): Promise<IWishlistModel> {
    const updatedWishlist = await this._wishlistRepository.removeCarFromWishlist(userId, carId);
    if (!updatedWishlist) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't remove car from wishlist.")
    }
    return updatedWishlist;
  };

  async getWishlist(userId: string): Promise<IWishlistModel> {
    const wishlist = await this._wishlistRepository.getWishlistByUserId(userId);
    if (!wishlist) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find your wishlist.")
    }
    return wishlist;
  };

  async getUserWishlist(userId: string, page: number, limit: number): Promise<IUserWishlistPaginatedResponse> {
    const { data, total } = await this._wishlistRepository.findPaginated(userId, page, limit);
    if (!data || data.length === 0) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find your wishlist");
    }
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      totalPages,
      currentPage: page
    };
  };
};