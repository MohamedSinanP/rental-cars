import { Request } from "express";
import { ISubscription, ISubscriptionModel, IUserSubscriptionModel } from "../../types/user";
import Stripe from "stripe";
import { PaginatedData } from "../../types/types";

export default interface ISubscriptionService {
  createSubscription(data: ISubscription): Promise<ISubscriptionModel>;
  getSubscriptions(): Promise<ISubscriptionModel[]>;
  editSubscription(subId: string, data: Partial<ISubscription>): Promise<ISubscription>;
  getActiveSubscriptions(): Promise<ISubscription[]>;
  makeSubscription(req: Request, priceId: string, subId: string): Promise<string>;
  handleWebhook(event: Stripe.Event): Promise<void>;
  handleCheckoutSessionCompleted(event: Stripe.Event): Promise<void>;
  getUserSubscription(req: Request): Promise<IUserSubscriptionModel | null>;
  getUsersSubscriptions(page: number, limit: number, search: string): Promise<PaginatedData<IUserSubscriptionModel>>;
  updateUserSubStatus(userId: string, status: string): Promise<IUserSubscriptionModel>;
  getUserAllSubscriptions(userId: string, page: number, limit: number): Promise<PaginatedData<IUserSubscriptionModel>>;
  cancelUserSub(subId: string): Promise<IUserSubscriptionModel>;
};