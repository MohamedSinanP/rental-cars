import { IUserSubscription, IUserSubscriptionModel } from "../../types/user";
import IBaseRepository from "./base.repository";

export default interface IUserSubsRepository extends IBaseRepository<IUserSubscriptionModel> {
  createSub(data: IUserSubscription): Promise<IUserSubscriptionModel>;
  findUserSubscription(userId: string): Promise<IUserSubscriptionModel | null>;
};