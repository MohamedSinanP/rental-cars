import { UserResponseDTO } from "../../types/user";
import { adminLoginResponse, AuthCheck, IJwtToken, LoginGoogleResponse, LoginResponse } from "../../types/types";
import { Request, Response } from "express";
import { Profile as GoogleProfile } from "passport-google-oauth20";
import { OwnerResponseDTO } from "../../types/owner";

export default interface IAuthService {
  signupConsumer(userName: string, email: string, password: string, role: string): Promise<UserResponseDTO>;
  signupOwner(userName: string, email: string, password: string, role: string, commision: number): Promise<OwnerResponseDTO>;
  adminLogin(email: string, password: string, res: Response): Promise<adminLoginResponse>;
  login(email: string, password: string, res: Response): Promise<LoginResponse>;
  googleAuth(profile: GoogleProfile): Promise<LoginGoogleResponse>;
  verifyOtp(email: string, otp: string, res: Response): Promise<IJwtToken>;
  resendOtp(email: string): Promise<void>;
  verifyEmail(email: string): Promise<void>;
  resetPassword(token: string, newPwd: string): Promise<void>;
  rotateRefreshToken(refreshToken: string): Promise<{ newAccessToken: string; newRefreshToken: string }>;
  logout(req: Request, res: Response): Promise<void>;
  getCurrentUser(userId: string): Promise<AuthCheck>;
}