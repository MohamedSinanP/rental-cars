import { inject, injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import TYPES from "../di/types";
import mongoose, { Model, Types } from "mongoose";
import { IWishlistModel, WishlistPaginatedItem } from "../types/user";
import IWishlitRepository from "../interfaces/repositories/wishlist.repository";


@injectable()
export default class WishlistRepository extends BaseRepository<IWishlistModel> implements IWishlitRepository {
  constructor(@inject(TYPES.WishlistModel) private _wishlistModel: Model<IWishlistModel>) {
    super(_wishlistModel);
  };

  async addCarToWishlist(userId: string, carId: string): Promise<IWishlistModel | null> {
    const userObjectId = new Types.ObjectId(userId);
    const carObjectId = new Types.ObjectId(carId);

    let wishlist = await this._wishlistModel.findOne({ userId: userObjectId });

    if (!wishlist) {
      wishlist = await this._wishlistModel.create({
        userId: userObjectId,
        cars: [{ car: carObjectId, addedAt: new Date() }],
      });
      return wishlist;
    }

    const exists = wishlist.cars.some(c => c.car.equals(carObjectId));
    if (exists) {
      return wishlist;
    }

    wishlist.cars.push({ car: carObjectId, addedAt: new Date() });

    await wishlist.save();
    return wishlist;
  }

  async removeCarFromWishlist(userId: string, carId: string): Promise<IWishlistModel | null> {
    const userObjectId = new Types.ObjectId(userId);
    const carObjectId = new Types.ObjectId(carId);

    const wishlist = await this._wishlistModel.findOne({ userId: userObjectId });
    if (!wishlist) {
      return null;
    }

    wishlist.cars = wishlist.cars.filter(c => !c.car.equals(carObjectId));

    await wishlist.save();
    return wishlist;
  }

  async getWishlistByUserId(userId: string): Promise<IWishlistModel | null> {
    const userObjectId = new Types.ObjectId(userId);
    return this._wishlistModel
      .findOne({ userId: userObjectId })
      .populate('cars.car')
      .exec();
  }

  async findPaginated(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ data: WishlistPaginatedItem[]; total: number }> {
    const skip = (page - 1) * limit;

    const result = await this._wishlistModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$cars" },
      { $sort: { "cars.addedAt": -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "cars",
                localField: "cars.car",
                foreignField: "_id",
                as: "carDetails"
              }
            },
            { $unwind: "$carDetails" },
            {
              $project: {
                _id: 0,
                addedAt: "$cars.addedAt",
                car: "$carDetails"
              }
            }
          ],
          totalCount: [
            { $count: "count" }
          ]
        }
      }
    ]);

    const data: WishlistPaginatedItem[] = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;

    return { data, total };
  }

};