export default interface IOwner {
  _id?: string;
  userName: string;
  email: string;
  role: string;
  password: string;
  commision: number;
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
  commision: number;
  otp?: string;
  otpExpiresAt?: Date;
  isBlocked?: boolean;
  isVerified?: boolean;
}
