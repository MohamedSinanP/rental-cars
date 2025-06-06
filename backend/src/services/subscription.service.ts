import { inject, injectable } from "inversify";
import ISubscriptionService from "../interfaces/services/subscription.service";
import TYPES from "../di/types";
import ISubscriptionRepository from "../interfaces/repositories/subscription.repository";
import { ISubscription, SubscriptionDTO, UserSubDTO } from "../types/user";
import { HttpError } from "../utils/http.error";
import { PaginatedData, StatusCode } from "../types/types";
import stripe from "../config/stripe";
import { Request } from "express";
import Stripe from "stripe";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import IUserSubsRepository from "../interfaces/repositories/user.subscription.repository";
import { Types } from "mongoose";
import { toSubscriptionDTO, toUserSubscriptionDTO } from "../utils/helperFunctions";

@injectable()
export default class SubscriptionService implements ISubscriptionService {
  constructor(
    @inject(TYPES.ISubscriptionRepository) private _subscriptionRepository: ISubscriptionRepository,
    @inject(TYPES.IUserSubsRepository) private _userSubsRepository: IUserSubsRepository,
    @inject(TYPES.IUserSubsRepository) private _userSubscriptionRepository: IUserSubsRepository
  ) { };
  async createSubscription(data: ISubscription): Promise<SubscriptionDTO> {
    const subscription = await this._subscriptionRepository.addSubscription(data);
    if (!subscription) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't add new subscription");
    };
    return toSubscriptionDTO(subscription);
  };

  async getSubscriptions(): Promise<SubscriptionDTO[]> {
    const subscriptions = await this._subscriptionRepository.findAll();
    if (!subscriptions) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find subscriptions");
    }
    return subscriptions.map(toSubscriptionDTO);
  };

  async editSubscription(subId: string, data: Partial<ISubscription>): Promise<SubscriptionDTO> {
    const updatedSubscription = await this._subscriptionRepository.update(subId, data);
    if (!updatedSubscription) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't update the subscription");
    }
    return toSubscriptionDTO(updatedSubscription);
  };

  async getActiveSubscriptions(): Promise<SubscriptionDTO[]> {
    const activeSubs = await this._subscriptionRepository.findAll({ isActive: true });
    if (!activeSubs) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't get subscriptions");
    };

    return activeSubs.map(toSubscriptionDTO);
  };

  async makeSubscription(req: Request, priceId: string, subId: string): Promise<string> {
    const { user } = req as AuthenticatedRequest;
    const userId = user?.userId!;
    const userObjId = new Types.ObjectId(user?.userId);
    const subObjId = new Types.ObjectId(subId);

    const existingSub = await this._userSubscriptionRepository.findOne({
      userId: userObjId,
      status: { $in: ['active', 'pending'] }
    });

    if (existingSub) {
      throw new HttpError(StatusCode.BAD_REQUEST, 'You already have a pending or active subscription');
    }

    const subscription = await this._subscriptionRepository.findOne({ stripePriceId: priceId });
    if (!subscription) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find the chosen subscription");
    }

    // Insert a pending lock before Stripe checkout session is created
    await this._userSubscriptionRepository.insertOne({
      userId: userObjId,
      subscriptionId: subObjId,
      status: 'pending',
      createdAt: new Date()
    });

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscription`,
      client_reference_id: userId,
      metadata: {
        userId,
        subscriptionId: subId
      }
    });
    if (session.url) {
      const session_url = session.url;
      return session_url;
    } else {
      throw new HttpError(StatusCode.INTERNAL_SERVER_ERROR, "Something went wrong");
    };

  };

  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        return this.handleCheckoutSessionCompleted(event);
      default:
        throw new HttpError(StatusCode.INTERNAL_SERVER_ERROR, `Unhandled event type: ${event.type}`);
    };
  };

  async handleCheckoutSessionCompleted(event: Stripe.Event): Promise<void> {
    interface ExtendedStripeSubscription extends Stripe.Subscription {
      current_period_start: number;
      current_period_end: number;
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, subscriptionId } = session.metadata!;

    if (session.subscription) {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
        {
          expand: ['items.data.price.product']
        }
      ) as Stripe.Subscription;


      const firstItem = stripeSubscription.items.data[0];
      const currentPeriodStartUnix = firstItem.current_period_start;
      const currentPeriodEndUnix = firstItem.current_period_end;
      await this._userSubsRepository.createSub({
        userId,
        subscriptionId,
        stripeSubscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
        currentPeriodStart: new Date(currentPeriodStartUnix * 1000),
        currentPeriodEnd: new Date(currentPeriodEndUnix * 1000)
      });
    };
  };

  async getUserSubscription(req: Request): Promise<UserSubDTO | null> {
    const { user } = req as AuthenticatedRequest;
    const userId = user?.userId!;
    let userSub;
    userSub = await this._userSubsRepository.getUserActiveSubscription(userId);

    if (!userSub) {
      return null;
    }
    return toUserSubscriptionDTO(userSub);
  };

  async getUsersSubscriptions(page: number, limit: number, search: string): Promise<PaginatedData<UserSubDTO>> {
    const { data, total } = await this._userSubsRepository.findUsersSubscriptions(page, limit, search);

    if (!data) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find your subscription");
    };
    const totalPages = Math.ceil(total / limit);
    return {
      data: data.map(toUserSubscriptionDTO),
      totalPages,
      currentPage: page,
    };
  };

  async updateUserSubStatus(subId: string, status: string): Promise<UserSubDTO> {
    if (status === 'cancelled') {
      return await this.cancelUserSub(subId);
    }
    const updatedUseSub = await this._userSubsRepository.update(subId, { status: status });
    if (!updatedUseSub) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't update user subscription status");
    }
    return toUserSubscriptionDTO(updatedUseSub);
  };

  async getUserAllSubscriptions(userId: string, page: number, limit: number): Promise<PaginatedData<UserSubDTO>> {
    const { data, total } = await this._userSubsRepository.getUserSubs(userId, page, limit);
    if (!total) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find your subscriptions");
    }
    const totalPages = Math.ceil(total / limit);
    return {
      data: data.map(toUserSubscriptionDTO),
      totalPages,
      currentPage: page,
    };
  }

  async cancelUserSub(subId: string): Promise<UserSubDTO> {
    const existingSub = await this._userSubsRepository.findById(subId);
    if (!existingSub) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Subscription not found");
    }

    await stripe.subscriptions.cancel(existingSub.stripeSubscriptionId);

    const cancelledSub = await this._userSubsRepository.update(subId, {
      status: 'cancelled'
    });
    if (!cancelledSub) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't cancel your subscriptoin.")
    }
    return toUserSubscriptionDTO(cancelledSub);
  };

  async getUserActiveSub(userId: string): Promise<UserSubDTO | null> {
    const activeSub = await this._userSubsRepository.getUserActiveSubscription(userId);
    if (!activeSub) {
      return null;
    }
    return toUserSubscriptionDTO(activeSub);
  };

  async markExpiredSubscriptionsAsCompleted(): Promise<number> {
    const result = await this._userSubsRepository.markExpiredAsCompleted();
    return result.modifiedCount;
  };

  async deleteStalePendingSubscriptions(): Promise<number> {
    const result = await this._userSubsRepository.deleteManyStalePending();
    return result.deletedCount;
  }
};