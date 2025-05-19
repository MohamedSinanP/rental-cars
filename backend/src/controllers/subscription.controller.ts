import { Request, Response, NextFunction } from "express";
import ISubscriptionController from "../interfaces/controllers/subscription.controller";
import { inject, injectable } from "inversify";
import TYPES from "../di/types";
import ISubscriptionService from "../interfaces/services/subscription.service";
import { ISubscription } from "../types/user";
import { StatusCode } from "../types/types";
import { HttpResponse } from "../utils/http.response";
import stripe, { Stripe } from "stripe";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

@injectable()
export default class SubscriptionController implements ISubscriptionController {
  constructor(@inject(TYPES.ISubscriptionService) private _subscriptionService: ISubscriptionService) { };

  async createSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedFeatures = JSON.parse(req.body.features)
      const subscriptionData: ISubscription = {
        name: req.body.name,
        description: req.body.description,
        features: parsedFeatures,
        stripeProductId: req.body.stripeProductId,
        stripePriceId: req.body.stripePriceId,
        price: req.body.price,
        billingCycle: req.body.billingCycle,
        isActive: true
      };
      const newSubscription = await this._subscriptionService.createSubscription(subscriptionData);
      res.status(StatusCode.CREATED).json(HttpResponse.created(newSubscription, "Subscriptoin created."));
    } catch (error) {
      next(error);
    };
  };

  async getSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subscriptions = await this._subscriptionService.getSubscriptions();
      res.status(StatusCode.OK).json(HttpResponse.success(subscriptions));
    } catch (error) {
      next(error);
    };
  };

  async editSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subId = req.params.id;
      const parsedFeatures = JSON.parse(req.body.features)
      const subEditData: Partial<ISubscription> = {
        name: req.body.name,
        description: req.body.description,
        features: parsedFeatures,
        price: req.body.price,
        billingCycle: req.body.billingCycle,
        stripeProductId: req.body.stripeProductId,
        stripePriceId: req.body.stripePriceId,
        isActive: req.body.isActive
      };

      const subscriptions = await this._subscriptionService.editSubscription(subId, subEditData);
      res.status(StatusCode.OK).json(HttpResponse.success(subscriptions, "Subscription updated."));
    } catch (error) {
      next(error);
    };
  };

  async getActiveSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeSubs = await this._subscriptionService.getActiveSubscriptions();
      res.status(StatusCode.OK).json(HttpResponse.success(activeSubs));
    } catch (error) {
      next(error);
    }
  };

  async makeSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { priceId, subId } = req.body;
      const session_url = await this._subscriptionService.makeSubscription(req, priceId, subId);
      res.status(StatusCode.OK).json({ url: session_url });
    } catch (error) {
      next(error);
    }
  };

  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET_KEY!
      );

      await this._subscriptionService.handleWebhook(event);
      res.json({ received: true });
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  };

  async getUserSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userSub = await this._subscriptionService.getUserSubscription(req);
      res.status(StatusCode.OK).json(HttpResponse.success(userSub));
    } catch (error) {
      next(error);
    };
  };

  async getUsersSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      const search = (req.query.search as string) || '';
      const usersSubs = await this._subscriptionService.getUsersSubscriptions(page, limit, search);
      res.status(StatusCode.OK).json(HttpResponse.success(usersSubs));
    } catch (error) {
      next(error);
    };
  };

  async changeUserSubscriptionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subId = req.params.id;
      const { status } = req.body;

      const updatedUserSub = await this._subscriptionService.updateUserSubStatus(subId, status);
      res.status(StatusCode.OK).json(HttpResponse.success(updatedUserSub));
    } catch (error) {
      next(error);
    }
  };

  async getUserAllSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      const userSubs = await this._subscriptionService.getUserAllSubscriptions(userId, page, limit);
      res.status(StatusCode.OK).json(HttpResponse.success(userSubs));
    } catch (error) {
      next(error);
    }
  };

  async cancelUserSub(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: subscriptionId } = req.params;
      if (!subscriptionId) {
        res.status(StatusCode.BAD_REQUEST).json(
          HttpResponse.error('Subscription ID is required')
        );
        return;
      }

      const result = await this._subscriptionService.cancelUserSub(subscriptionId);
      res.status(StatusCode.OK).json(HttpResponse.success(result, 'Subscription cancelled successfully'));
    } catch (error) {
      next(error);
    }
  };

  async getUserActiveSub(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId;
      const activeUserSub = await this._subscriptionService.getUserActiveSub(userId);

      if (!activeUserSub) {
        res.status(StatusCode.OK).json(HttpResponse.success({}));
        return;
      }
      res.status(StatusCode.OK).json(HttpResponse.success(activeUserSub));
    } catch (error) {
      next(error);
    }
  };

};