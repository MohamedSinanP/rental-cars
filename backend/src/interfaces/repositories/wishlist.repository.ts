import { IWishlistModel, WishlistPaginatedItem } from "../../types/user";
import IBaseRepository from "./base.repository";

export default interface IWishlitRepository extends IBaseRepository<IWishlistModel> {
  addCarToWishlist(userId: string, carId: string): Promise<IWishlistModel | null>;
  removeCarFromWishlist(userId: string, carId: string): Promise<IWishlistModel | null>;
  getWishlistByUserId(userId: string): Promise<IWishlistModel | null>;
  findPaginated(userId: string, page: number, limit: number): Promise<{ data: WishlistPaginatedItem[]; total: number }>;
};