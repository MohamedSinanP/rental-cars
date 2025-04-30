import { inject, injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import TYPES from "../di/types";
import { Model } from "mongoose";
import { ISubscription, ISubscriptionModel } from "../types/user";
import ISubscriptionRepository from "../interfaces/repositories/subscription.repository";


@injectable()
export default class SubscriptionRepository extends BaseRepository<ISubscriptionModel> implements ISubscriptionRepository {
  constructor(@inject(TYPES.SubscriptionModel) private subscriptionModel: Model<ISubscriptionModel>) {
    super(subscriptionModel);
  };
  async addSubscription(data: ISubscription): Promise<ISubscriptionModel> {
    return await this.subscriptionModel.create(data);
  };
};