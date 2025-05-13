import { inject, injectable } from "inversify";
import ISubscriptionService from "../interfaces/services/subscription.service";
import TYPES from "../di/types";
import ISubscriptionRepository from "../interfaces/repositories/subscription.repository";
import { ISubscription, ISubscriptionModel, IUserSubscriptionModel } from "../types/user";
import { HttpError } from "../utils/http.error";
import { PaginatedData, StatusCode } from "../types/types";
import stripe from "../config/stripe";
import { Request } from "express";
import Stripe from "stripe";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import IUserSubsRepository from "../interfaces/repositories/user.subscription.repository";
import IUserRepository from "../interfaces/repositories/user.repository";
import { Types } from "mongoose";

@injectable()
export default class SubscriptionService implements ISubscriptionService {
  constructor(
    @inject(TYPES.ISubscriptionRepository) private _subscriptionRepository: ISubscriptionRepository,
    @inject(TYPES.IUserSubsRepository) private _userSubsRepository: IUserSubsRepository,
    @inject(TYPES.IUserSubsRepository) private _userSubscriptionRepository: IUserSubsRepository
  ) { };
  async createSubscription(data: ISubscription): Promise<ISubscriptionModel> {
    const subscription = await this._subscriptionRepository.addSubscription(data);
    if (!subscription) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't add new subscription");
    };
    return subscription;
  };

  async getSubscriptions(): Promise<ISubscriptionModel[]> {
    const subscriptions = await this._subscriptionRepository.findAll();
    if (!subscriptions) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find subscriptions");
    }
    return subscriptions
  };

  async editSubscription(subId: string, data: Partial<ISubscription>): Promise<ISubscription> {
    const updatedSubscription = await this._subscriptionRepository.update(subId, data);
    if (!updatedSubscription) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't update the subscription");
    }
    return updatedSubscription;
  };

  async getActiveSubscriptions(): Promise<ISubscription[]> {
    const activeSubs = await this._subscriptionRepository.findAll({ isActive: true });
    if (!activeSubs) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't get subscriptions");
    };

    return activeSubs;
  };

  async makeSubscription(req: Request, priceId: string, subId: string): Promise<string> {
    const { user } = req as AuthenticatedRequest;
    const userId = user?.userId!;
    const userObjId = new Types.ObjectId(user?.userId);

    const existingActiveSub = await this._userSubscriptionRepository.findOne({ userId: userObjId, status: 'active' })

    if (existingActiveSub) {
      throw new HttpError(StatusCode.BAD_REQUEST, 'You already have an active subscription');
    }


    const subscription = await this._subscriptionRepository.findOne({ stripePriceId: priceId });
    if (!subscription) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Cant' find the choosed subscription");
    };

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
      // case 'invoice.payment_succeeded':
      //   return handleInvoicePaymentSucceeded(event);
      // case 'invoice.payment_failed':
      //   return handleInvoicePaymentFailed(event);
      // case 'customer.subscription.updated':
      //   return handleCustomerSubscriptionUpdated(event);
      // case 'customer.subscription.deleted':
      //   return handleCustomerSubscriptionDeleted(event);
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
        currentPeriodEnd: new Date(currentPeriodEndUnix * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
      });

    };
  };

  async getUserSubscription(req: Request): Promise<IUserSubscriptionModel | null> {
    const { user } = req as AuthenticatedRequest;
    const userId = user?.userId!;
    let userSub;
    userSub = await this._userSubsRepository.findUserSubscription(userId);

    if (!userSub) {
      return null;
    }
    if (userSub.currentPeriodEnd <= new Date()) {
      userSub = await this._userSubsRepository.update(
        userSub._id.toString(),
        { cancelAtPeriodEnd: true, status: 'completed' },
      );
    };
    return userSub;
  };

  async getUsersSubscriptions(page: number, limit: number, search: string): Promise<PaginatedData<IUserSubscriptionModel>> {
    const { data, total } = await this._userSubsRepository.findUsersSubscriptions(page, limit, search);

    if (!data) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find your subscription");
    };
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      totalPages,
      currentPage: page,
    };
  };

  async updateUserSubStatus(subId: string, status: string): Promise<IUserSubscriptionModel> {
    const updatedUseSub = await this._userSubsRepository.update(subId, { status: status });
    if (!updatedUseSub) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't update user subscription status");
    }
    return updatedUseSub;
  };

  async getUserAllSubscriptions(userId: string, page: number, limit: number): Promise<PaginatedData<IUserSubscriptionModel>> {
    const { data, total } = await this._userSubsRepository.getUserSubs(userId, page, limit);
    if (!total) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find your subscriptions");
    }
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      totalPages,
      currentPage: page,
    };
  }

  async cancelUserSub(subId: string): Promise<IUserSubscriptionModel> {
    const cancelledSub = await this._userSubsRepository.update(subId, { status: 'cancelled' });
    if (!cancelledSub) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find your subscriptions");
    }
    return cancelledSub;
  }
};