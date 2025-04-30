import mongoose, { Document } from "mongoose";

export default interface IUser {
  _id?: string;
  userName: string;
  email: string;
  password: string;
  role: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  googleId?: string;
  otp?: string | null;
  otpExpiresAt?: Date | null;
  otpLastSentAt?: Date | null;
  refreshToken?: string | null;
  resetToken?: string | null;
  resetTokenExpiresAt?: Date | null;
  isBlocked: boolean;
  isVerified: boolean;
  subscriptionId?: string
};

export interface IUserGoogle {
  userName: string;
  email: string;
  role: string;
  googleId?: string;
  isBlocked: boolean;
  isVerified: boolean;
};

export interface userData {
  userName?: string;
  email?: string;
  password?: string;
  role?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  otp?: string;
  otpExpiresAt?: Date;
  isBlocked?: boolean;
  isVerified?: boolean;
};

export interface IAdmin {
  _id?: string;
  email: string;
  password: string;
  role: string;
  refreshToken: string | null;
};

export interface ISubscription {
  name: string;
  description: string;
  features: string[];
  stripeProductId: string;
  stripePriceId: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  isActive: boolean;
}

export interface ISubscriptionModel extends ISubscription, Document { };

export interface IUserSubscription {
  userId: string;
  subscriptionId: string;
  stripeSubscriptionId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
};

export interface IUserSubscriptionModel extends Document {
  userId: mongoose.Types.ObjectId;
  subscriptionId: mongoose.Types.ObjectId;
  stripeSubscriptionId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
};

export interface IAddress {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
};

export interface IAddressModel extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
}

