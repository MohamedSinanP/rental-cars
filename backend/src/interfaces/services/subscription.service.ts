import { Request } from "express";
import { ISubscription, ISubscriptionModel, IUserSubscriptionModel } from "../../types/user";
import Stripe from "stripe";

export default interface ISubscriptionService {
  createSubscription(data: ISubscription): Promise<ISubscriptionModel>;
  getSubscriptions(): Promise<ISubscriptionModel[]>;
  editSubscription(subId: string, data: Partial<ISubscription>): Promise<ISubscription>;
  getActiveSubscriptions(): Promise<ISubscription[]>;
  makeSubscription(req: Request, priceId: string, subId: string): Promise<string>;
  handleWebhook(event: Stripe.Event): Promise<void>;
  handleCheckoutSessionCompleted(event: Stripe.Event): Promise<void>;
  getUserSubscription(req: Request): Promise<IUserSubscriptionModel | null>;
  getUsersSubscriptions(): Promise<IUserSubscriptionModel[]>;
  updateUserSubStatus(userId: string, status: string): Promise<IUserSubscriptionModel>;
}