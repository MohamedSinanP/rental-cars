import mongoose, { Document } from "mongoose";

export default interface IOwner {
  _id?: string;
  userName: string;
  email: string;
  role: string;
  password: string;
  commission: number;
  otp?: string | null;
  otpExpiresAt?: Date | null;
  otpLastSentAt?: Date | null;
  refreshToken?: string | null;
  resetToken?: string | null;
  resetTokenExpiresAt?: Date | null;
  isBlocked: boolean;
  isVerified: boolean;
}
export interface IOwnerModel extends Document {
  _id: mongoose.Types.ObjectId;
  userName: string;
  email: string;
  role: string;
  password: string;
  commission: number;
  otp?: string | null;
  otpExpiresAt?: Date | null;
  otpLastSentAt?: Date | null;
  refreshToken?: string | null;
  resetToken?: string | null;
  resetTokenExpiresAt?: Date | null;
  isBlocked: boolean;
  isVerified: boolean;
}


export interface ownerData {
  userName?: string;
  email?: string;
  password?: string;
  role?: string;
  commission: number;
  otp?: string;
  otpExpiresAt?: Date;
  isBlocked?: boolean;
  isVerified?: boolean;
}


export interface OwnerResponseDTO {
  id: string;
  userName: string;
  email: string;
  role: string;
  isBlocked?: boolean;
  isVerified?: boolean;
  commission?: number;
}