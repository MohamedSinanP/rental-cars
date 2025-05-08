import { inject, injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import TYPES from "../di/types";
import { Model } from "mongoose";
import { IUserSubscription, IUserSubscriptionModel } from "../types/user";
import IUserSubsRepository from "../interfaces/repositories/user.subscription.repository";


@injectable()
export default class UserSubsRepository extends BaseRepository<IUserSubscriptionModel> implements IUserSubsRepository {
  constructor(@inject(TYPES.UserSubsModel) private _userSubsModel: Model<IUserSubscriptionModel>) {
    super(_userSubsModel);
  };
  async createSub(data: IUserSubscription): Promise<IUserSubscriptionModel> {
    return await this._userSubsModel.create(data);
  };

  async findUserSubscription(userId: string): Promise<IUserSubscriptionModel | null> {
    return await this._userSubsModel.findOne({
      userId,
      status: 'active',
      cancelAtPeriodEnd: false,
    })
      .sort({ currentPeriodEnd: -1 })
      .populate('subscriptionId')
      .populate('userId')
      .lean();
  };

  async findUsersSubscriptions(page: number, limit: number, search: string): Promise<{ data: IUserSubscriptionModel[]; total: number }> {
    const skip = (page - 1) * limit;

    const searchQuery = search
      ? {
        $or: [
          { status: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ]
      }
      : {};

    const data = await this._userSubsModel.find(searchQuery).skip(skip).limit(limit)
      .populate('subscriptionId')
      .populate('userId');
    const total = await this._userSubsModel.countDocuments();
    return { data, total };
  };
  async findLatestActiveByUserId(userId: string): Promise<IUserSubscriptionModel | null> {
    return await this._userSubsModel.findOne({
      userId,
      status: 'active',
      cancelAtPeriodEnd: false,
    }).sort({ currentPeriodEnd: -1 });
  };
  async getTotalSubscriptionEarnings(): Promise<number> {
    const result = await this._userSubsModel.aggregate([
      {
        $match: {
          status: "active"
        }
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "subscriptionId",
          foreignField: "_id",
          as: "subscriptionData"
        }
      },
      {
        $unwind: "$subscriptionData"
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$subscriptionData.price" }
        }
      }
    ]);

    return result[0]?.totalEarnings || 0;
  }
};