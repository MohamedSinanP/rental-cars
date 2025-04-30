import IBaseRepository from "./base.repository";
import { ISubscription, ISubscriptionModel } from "../../types/user";

export default interface ISubscriptionRepository extends IBaseRepository<ISubscriptionModel> {
  addSubscription(data: ISubscription): Promise<ISubscriptionModel>;
};
