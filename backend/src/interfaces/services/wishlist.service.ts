import { IUserModel, IUserWishlistPaginatedResponse, IUserWishlistPaginatedResponseDTO, IWishlistModel, WishlistDTO } from "../../types/user";
import { PaginatedData } from "../../types/types";
import IUser, { IAddressModel, IWalletModel, userData } from "../../types/user";



export default interface IWishlistService {
  addToWishlist(userId: string, carId: string): Promise<WishlistDTO>;
  removeFromWishlist(userId: string, carId: string): Promise<WishlistDTO>;
  getWishlist(userId: string): Promise<WishlistDTO>;
  getUserWishlist(userId: string, page: number, limit: number): Promise<IUserWishlistPaginatedResponseDTO>;
};