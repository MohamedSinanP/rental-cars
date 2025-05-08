import { Schema, model } from 'mongoose';
import { IBookingModel } from '../types/booking';


const bookingSchema = new Schema<IBookingModel>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  carId: {
    type: Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'Owner',
    required: true,
  },
  userDetails: {
    address: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },
  carLocation: {
    address: String,
    latitude: Number,
    longitude: String,
  },
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  pickupDateTime: { type: Date, required: true },
  dropoffDateTime: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['wallet', 'stripe'],
    required: true,
  },
  paymentId: { type: String, required: false },
  isPremiumBooking: {
    type: Boolean,
    required: false
  },
  discountAmount: {
    type: Number,
    required: false
  },
  discountPercentage: {
    type: Number,
    required: false
  },
  commissionPercentage: {
    type: Number,
    required: true
  },
  adminCommissionAmount: {
    type: Number,
    required: true
  },
  ownerEarning: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
  },
}, { timestamps: true });

const Booking = model<IBookingModel>('Booking', bookingSchema);

export default Booking;
