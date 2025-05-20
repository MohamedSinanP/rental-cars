import { IUserSubscription, IUserSubscriptionCreate, IUserSubscriptionModel } from "../../types/user";
import IBaseRepository from "./base.repository";

export default interface IUserSubsRepository extends IBaseRepository<IUserSubscriptionModel> {
  createSub(data: IUserSubscription): Promise<IUserSubscriptionModel>;
  getUserActiveSubscription(userId: string): Promise<IUserSubscriptionModel | null>;
  findUsersSubscriptions(page: number, limit: number, search: string): Promise<{ data: IUserSubscriptionModel[]; total: number }>;
  findLatestActiveByUserId(userId: string): Promise<IUserSubscriptionModel | null>;
  getTotalSubscriptionEarnings(): Promise<number>;
  getTotalEarnings(type: string, year: number, from: string, to: string): Promise<number>;
  getUserSubs(userId: string, page: number, limit: number): Promise<{ data: IUserSubscriptionModel[]; total: number }>;
  markExpiredAsCompleted(): Promise<{ modifiedCount: number }>;
  insertOne(data: IUserSubscriptionCreate): Promise<IUserSubscriptionModel>;
  deleteManyStalePending(): Promise<{ deletedCount: number }>;
};