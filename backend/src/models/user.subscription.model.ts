import { Schema, model, } from "mongoose";
import { IUserSubscriptionModel } from "../types/user";

const userSubscriptionSchema = new Schema<IUserSubscriptionModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
    stripeSubscriptionId: { type: String, required: false },
    status: { type: String, required: true },
    currentPeriodStart: { type: Date, required: false },
    currentPeriodEnd: { type: Date, required: false },
  },
  { timestamps: true }
);

export const UserSubscription = model<IUserSubscriptionModel>("UserSubscription", userSubscriptionSchema);