import mongoose, { Document, Types } from "mongoose";
import IUser, { UserResponseDTO } from "./user";
import ICar, { CarDTO } from "./car";
import IOwner, { OwnerResponseDTO } from "./owner";

export interface BookingDTO {
  id: string;
  userId: string | UserResponseDTO;
  carId: string | CarDTO;
  ownerId: string | OwnerResponseDTO;
  userDetails: {
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
  };
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: Date;
  dropoffDateTime: Date;
  totalPrice: number;
  paymentStatus: string;
  paymentMethod: string;
  status: string;
  commissionPercentage: number;
  adminCommissionAmount: number;
  ownerEarning: number;
}


export interface IBooking {
  _id?: string;
  userId: string;
  carId: string;
  ownerId: string;
  userDetails: {
    address: string;
    email: string;
    name: string;
    phoneNumber: string;
  };
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: Date;
  dropoffDateTime: Date;
  totalPrice: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'wallet' | 'stripe';
  paymentId: string;
  status?: 'active' | 'cancelled' | 'completed';
  isPremiumBooking?: boolean;
  discountAmount?: number;
  discountPercentage?: number;
  commissionPercentage?: number;
  adminCommissionAmount?: number;
  ownerEarning?: number;
};
export interface IBookingModel extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  carId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  userDetails: {
    address: string;
    email: string;
    name: string;
    phoneNumber: string;
  };
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: Date;
  dropoffDateTime: Date;
  totalPrice: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'wallet' | 'stripe';
  paymentId?: string;
  status?: 'active' | 'cancelled' | 'completed';
  isPremiumBooking?: boolean;
  discountAmount?: number;
  discountPercentage?: number;
  commissionPercentage: number;
  adminCommissionAmount: number;
  ownerEarning: number;
};

type MonthlyStatsForAdmin = {
  month: number;
  totalCommission: number;
  count: number;
};

type YearlyStatsForAdmin = {
  year: number;
  totalCommission: number;
  count: number;
};

type CustomStatsForAdmin = {
  date: string;
  totalCommission: number;
  count: number;
};

export type RentalStatsForAdmin = MonthlyStatsForAdmin | YearlyStatsForAdmin | CustomStatsForAdmin;
type MonthlyStatsForOwner = {
  month: number;
  totalEarnings: number;
  count: number;
};

type YearlyStatsForOwner = {
  year: number;
  totalEarnings: number;
  count: number;
};

type CustomStatsForOwner = {
  date: string;
  totalEarnings: number;
  count: number;
};

export type RentalStatsForOwner = MonthlyStatsForOwner | YearlyStatsForOwner | CustomStatsForOwner;

export interface IBookingPopulated extends Omit<IBooking, '_id' | 'userId' | 'carId' | 'ownerId'> {
  _id: Types.ObjectId;
  userId: IUser;
  carId: ICar;
  ownerId: IOwner;
  createdAt: Date
};

export interface SalesInformation {
  totalBookings: number;
  totalEarnings: number;
  totalDiscount: number;
  totalCommission: number;
  earningsByCommission: number;
  earningsBySubscription: number;
  bookings: IBookingModel[];
}

export type BasicSalesInfo = {
  totalEarnings: number;
  totalCommissionEarnings: number;
  totalOwnerEarnings: number;
  totalDiscount: number;
  totalBookings: number;
  premiumBookings: number;
  refundedBookings: number;
  averageOrderValue: number;
};