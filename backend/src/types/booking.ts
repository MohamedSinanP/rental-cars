import mongoose, { Document } from "mongoose";

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
  carLocation?: {
    address?: string;
    latitude?: number;
    longitude?: string;
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
};
export interface IBookingModel extends Document {
  userId: mongoose.Types.ObjectId;
  carId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  userDetails: {
    address: string;
    email: string;
    name: string;
    phoneNumber: string;
  };
  carLocation?: {
    address?: string;
    latitude?: number;
    longitude?: string;
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
};
