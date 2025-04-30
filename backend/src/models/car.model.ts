import mongoose, { Schema, model, Document } from "mongoose";
import { ICarModel } from "../types/car";


const carSchema = new Schema<ICarModel>(
  {
    carName: { type: String, required: true },
    carModel: { type: String, required: true },
    carType: { type: String, required: true },
    seats: { type: String, required: true },
    transmission: { type: String, required: true },
    fuelType: { type: String, required: true },
    fuelOption: { type: String, required: true },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      required: true
    },
    carImages: [{ type: String, required: true }],
    rcDoc: { type: String, required: true },
    pucDoc: { type: String, required: true },
    insuranceDoc: { type: String, required: true },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationRejected: {
      type: Boolean,
      default: false,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: { type: String, required: true },
    },
    availability: {
      type: String,
      enum: ["Available", "Unavailable"],
      required: true,
    },
    features: [{ type: String }],
    pricePerDay: { type: Number, required: true },
    deposit: { type: Number, required: true },
    lastmaintenanceDate: { type: String, required: true },
    maintenanceInterval: { type: Number, required: true },
    isListed: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

carSchema.index({ location: "2dsphere" });

export const Car = model<ICarModel>("Car", carSchema);
