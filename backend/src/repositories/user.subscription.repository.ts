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

  async getUserActiveSubscription(userId: string): Promise<IUserSubscriptionModel | null> {
    return await this._userSubsModel.findOne({
      userId,
      status: 'active',
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
          status: { $in: ["active", "cancelled", "completed"] }
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
  };

  async getTotalEarnings(type: string, year: number, from: string, to: string): Promise<number> {
    const matchConditions: any = {
      status: { $in: ['active', 'cancelled', 'completed'] }
    };

    if (type === 'yearly') {
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year}-12-31`);
      matchConditions.currentPeriodStart = { $gte: start, $lte: end };
    }

    if (type === 'monthly') {
      const start = new Date(`${year}-${from}-01`);
      const end = new Date(`${year}-${from}-31`); // rough end of month
      matchConditions.currentPeriodStart = { $gte: start, $lte: end };
    }

    if (type === 'custom') {
      const start = new Date(from);
      const end = new Date(to);
      matchConditions.currentPeriodStart = { $gte: start, $lte: end };
    }

    const result = await this._userSubsModel.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: 'subscriptions',
          localField: 'subscriptionId',
          foreignField: '_id',
          as: 'subscription'
        }
      },
      { $unwind: '$subscription' },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$subscription.price' }
        }
      }
    ]);

    return result.length > 0 ? result[0].totalEarnings : 0;
  };

  async getUserSubs(userId: string, page: number, limit: number): Promise<{ data: IUserSubscriptionModel[]; total: number; }> {
    const skip = (page - 1) * limit;

    const data = await this._userSubsModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('subscriptionId');

    const total = await this._userSubsModel.countDocuments({ userId });

    return { data, total };
  };

  async markExpiredAsCompleted(): Promise<{ modifiedCount: number }> {
    const now = new Date();
    const result = await this._userSubsModel.updateMany(
      {
        status: 'active',
        currentPeriodEnd: { $lt: now }
      },
      {
        $set: { status: 'completed' }
      }
    );

    return { modifiedCount: result.modifiedCount };
  }
};