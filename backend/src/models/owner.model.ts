import { Schema, model, Document } from "mongoose";
import IOwner from "../types/owner";

export interface IOwnerModel extends Document, Omit<IOwner, '_id'> { }

const ownerSchema = new Schema<IOwnerModel>(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    commision: {
      type: Number,
      required: true,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Owner = model<IOwnerModel>("Owner", ownerSchema);
