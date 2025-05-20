import { Request } from "express";
import { ISubscription, SubscriptionDTO, UserSubDTO } from "../../types/user";
import Stripe from "stripe";
import { PaginatedData } from "../../types/types";

export default interface ISubscriptionService {
  createSubscription(data: ISubscription): Promise<SubscriptionDTO>;
  getSubscriptions(): Promise<SubscriptionDTO[]>;
  editSubscription(subId: string, data: Partial<ISubscription>): Promise<SubscriptionDTO>;
  getActiveSubscriptions(): Promise<SubscriptionDTO[]>;
  makeSubscription(req: Request, priceId: string, subId: string): Promise<string>;
  handleWebhook(event: Stripe.Event): Promise<void>;
  handleCheckoutSessionCompleted(event: Stripe.Event): Promise<void>;
  getUserSubscription(req: Request): Promise<UserSubDTO | null>;
  getUsersSubscriptions(page: number, limit: number, search: string): Promise<PaginatedData<UserSubDTO>>;
  updateUserSubStatus(userId: string, status: string): Promise<UserSubDTO>;
  getUserAllSubscriptions(userId: string, page: number, limit: number): Promise<PaginatedData<UserSubDTO>>;
  cancelUserSub(subId: string): Promise<UserSubDTO>;
  getUserActiveSub(userId: string): Promise<UserSubDTO | null>;
  markExpiredSubscriptionsAsCompleted(): Promise<number>;
  deleteStalePendingSubscriptions(): Promise<number>;
};