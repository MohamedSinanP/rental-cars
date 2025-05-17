import mongoose, { Document } from "mongoose";
import { Role } from "./types";
import ICar from "./car";

export default interface IUser {
  _id?: string;
  userName: string;
  email: string;
  password: string;
  role: string;
  profilePic?: string | null;
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
};
export interface IUserModel extends Document {
  _id: mongoose.Types.ObjectId;
  userName: string;
  email: string;
  password: string;
  role: string;
  profilePic?: string | null;
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
  _id?: string;
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
};

export interface IUserSubscriptionModel extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  subscriptionId: mongoose.Types.ObjectId;
  stripeSubscriptionId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
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

export type TTransaction = {
  paymentType: string;
  transactionAmount: number;
  transactionId?: string;
  date: Date;
};

export type TWallet = {
  userId: mongoose.Types.ObjectId;
  balance: number;
  transactions: TTransaction[];
};
export interface IWalletModel extends Document {
  userId: mongoose.Types.ObjectId;
  transactions: TTransaction[];
  balance: number;
};

export interface IReview {
  userId: string
  carId: string;
  rating: number;
  comment: string;
};

export interface IReviewModel extends Document {
  userId: mongoose.Types.ObjectId;
  carId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
};

export interface UserResponseDTO {
  id: string;
  userName: string;
  email: string;
  role: string;
  isVerified: boolean;
  isBlocked: boolean
};

export interface IWishlistCar {
  car: string;
  addedAt: Date;
}

export interface IWishlist {
  userId: string;
  cars: IWishlistCar[];
}

export interface IWishlistModel extends Document {
  userId: mongoose.Types.ObjectId;
  cars: {
    car: mongoose.Types.ObjectId;
    addedAt: Date;
  }[];
}

export type WishlistPaginatedItem = {
  addedAt: Date;
  car: ICar;
};


export interface IUserWishlistPaginatedResponse {
  data: WishlistPaginatedItem[];
  totalPages: number;
  currentPage: number;
};