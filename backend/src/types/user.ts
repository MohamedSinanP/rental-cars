import { Document } from "mongoose";

export default interface IUser {
  _id?: string;
  userName: string;
  email: string;
  password: string;
  role: string;
  googleId?: string;
  otp?: string | null;
  otpExpiresAt?: Date | null;
  otpLastSentAt?: Date | null;
  refreshToken?: string | null;
  resetToken?: string | null;
  resetTokenExpiresAt?: Date | null;
  isBlocked: boolean;
  isVerified: boolean;
}

export interface IUserGoogle {
  userName: string;
  email: string;
  role: string;
  googleId?: string;
  isBlocked: boolean;
  isVerified: boolean;
}

export interface userData {
  userName?: string;
  email?: string;
  password?: string;
  role?: string;
  otp?: string;
  otpExpiresAt?: Date;
  isBlocked?: boolean;
  isVerified?: boolean;
}

