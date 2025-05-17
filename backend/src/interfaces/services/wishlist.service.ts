import { IUserModel, IUserWishlistPaginatedResponse, IWishlistModel } from "../../types/user";
import { PaginatedData } from "../../types/types";
import IUser, { IAddressModel, IWalletModel, userData } from "../../types/user";



export default interface IWishlistService {
  addToWishlist(userId: string, carId: string): Promise<IWishlistModel>;
  removeFromWishlist(userId: string, carId: string): Promise<IWishlistModel>;
  getWishlist(userId: string): Promise<IWishlistModel>;
  getUserWishlist(userId: string, page: number, limit: number): Promise<IUserWishlistPaginatedResponse>;
};