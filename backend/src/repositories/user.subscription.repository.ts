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

  async findUsersSubscriptions(): Promise<IUserSubscriptionModel[]> {
    return await this._userSubsModel.find()
      .populate('subscriptionId')
      .populate('userId');
  };
  async findLatestActiveByUserId(userId: string): Promise<IUserSubscriptionModel | null> {
    return await this._userSubsModel.findOne({
      userId,
      status: 'active',
      cancelAtPeriodEnd: false,
    }).sort({ currentPeriodEnd: -1 });
  };
};