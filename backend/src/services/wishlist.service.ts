import { inject, injectable } from "inversify";
import IWishlistService from "../interfaces/services/wishlist.service";
import TYPES from "../di/types";
import IWishlitRepository from "../interfaces/repositories/wishlist.repository";
import { IUserWishlistPaginatedResponse, IUserWishlistPaginatedResponseDTO, IWishlistModel, WishlistDTO } from "../types/user";
import { HttpError } from "../utils/http.error";
import { StatusCode } from "../types/types";
import { mapToCarDTO, toWishlistDTO } from "../utils/helperFunctions";


@injectable()
export default class WishlistService implements IWishlistService {
  constructor(@inject(TYPES.IWishlistRepository) private _wishlistRepository: IWishlitRepository) { }

  async addToWishlist(userId: string, carId: string): Promise<WishlistDTO> {
    const wishlist = await this._wishlistRepository.addCarToWishlist(userId, carId);
    if (!wishlist) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't add to wishlist.");
    }
    return toWishlistDTO(wishlist);
  };

  async removeFromWishlist(userId: string, carId: string): Promise<WishlistDTO> {
    const updatedWishlist = await this._wishlistRepository.removeCarFromWishlist(userId, carId);
    if (!updatedWishlist) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't remove car from wishlist.")
    }
    return toWishlistDTO(updatedWishlist);
  };

  async getWishlist(userId: string): Promise<WishlistDTO> {
    const wishlist = await this._wishlistRepository.getWishlistByUserId(userId);
    if (!wishlist) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find your wishlist.")
    }
    return toWishlistDTO(wishlist);
  };

  async getUserWishlist(userId: string, page: number, limit: number): Promise<IUserWishlistPaginatedResponseDTO> {
    const { data, total } = await this._wishlistRepository.findPaginated(userId, page, limit);

    if (!data || data.length === 0) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find your wishlist");
    }

    const totalPages = Math.ceil(total / limit);

    const mappedData = data.map(item => ({
      addedAt: item.addedAt,
      car: mapToCarDTO(item.car),
    }));

    return {
      data: mappedData,
      totalPages,
      currentPage: page,
    };
  }
};