import { Document, ObjectId } from "mongoose";

export interface IBooking {
  _id?: string;
  userId: string;
  carId: string;
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
};
export interface IBookingModel extends Document {
  userId: ObjectId;
  carId: ObjectId;
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
};
