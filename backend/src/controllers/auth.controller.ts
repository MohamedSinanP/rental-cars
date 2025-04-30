import { inject, injectable } from "inversify";
import IAuthController from "../interfaces/controllers/auth.controller";
import TYPES from "../di/types";
import IAuthService from "../interfaces/services/auth.service";
import { NextFunction, Request, Response } from "express";
import { Role, StatusCode } from "../types/types";
import { HttpResponse } from "../utils/http.response";
import { Profile as GoogleProfile } from "passport-google-oauth20";
import { HttpError } from "../utils/http.error";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";



@injectable()
export default class AuthController implements IAuthController {
  constructor(@inject(TYPES.IAuthService) private authService: IAuthService) { };

  async signupUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userName, email, password, role }: { userName: string, email: string, password: string, role: Role.USER } = req.body;
      const user = await this.authService.signupConsumer(userName, email, password, role);
      res.status(StatusCode.CREATED).json(HttpResponse.success(user));
    } catch (error: any) {
      next(error);
    };
  };

  async signupOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userName, email, password, role, commision }: { userName: string, email: string, password: string, role: Role.OWNER, commision: number } = req.body;
      const owner = await this.authService.signupOwner(userName, email, password, role, commision);
      res.status(StatusCode.CREATED).json(HttpResponse.success(owner, "OTP sended successfully"));
    } catch (error: any) {
      next(error);
    };
  };

  async adminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await this.authService.adminLogin(email, password, res);
      res.status(StatusCode.OK).json(HttpResponse.success(user, "You are logged in successfully"));
    } catch (error) {
      next(error);
    };
  };

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password }: { email: string, password: string } = req.body;
      const userDetails = await this.authService.login(email, password, res);
      res.status(StatusCode.OK).json(HttpResponse.success({ userDetails }, "You are logged in successfully"));
    } catch (error) {
      next(error);
    };
  };

  async handleGoogleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = req.user as GoogleProfile;
      const { accessToken, refreshToken, user } = await this.authService.googleAuth(profile);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(`${process.env.CLIENT_URL}/auth/google?token=${accessToken}`);
    } catch (error) {
      next(error)
    };
  };

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const { email, otp }: { email: string, otp: string } = req.body;
      const token = await this.authService.verifyOtp(email, otp, res);
      res.status(StatusCode.OK).json(HttpResponse.success({ token: token.accessToken }, "OTP verified successfully"))

    } catch (error: any) {
      next(error);
    }
  };

  async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        throw new HttpError(StatusCode.BAD_REQUEST, "Email is required");
      };

      await this.authService.resendOtp(email);
      res.status(StatusCode.OK).json(HttpResponse.success({}, "New OTP sended successfully."))
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const { email }: { email: string } = req.body;
      await this.authService.verifyEmail(email);
      res.status(StatusCode.OK).json(HttpResponse.success({}, "reset passwrod link send to your email "));

    } catch (error: any) {
      next(error);
    };
  };

  async verifyResetOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp }: { email: string, otp: string } = req.body;
      await this.authService.resetPassword(email, otp);
      res.status(StatusCode.OK).json(HttpResponse.success({}, "OTP verified successfully"));
    } catch (error) {
      next(error);
    };
  };

  async resetPwd(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPwd }: { token: string, newPwd: string } = req.body;
      await this.authService.resetPassword(token, newPwd);
      res.status(StatusCode.OK).json(HttpResponse.success({}, "Password changed successfully"));
    } catch (error) {
      next(error);
    };
  };

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { newAccessToken, newRefreshToken } = await this.authService.rotateRefreshToken(req.cookies.refreshToken);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(StatusCode.OK).json(HttpResponse.success({ newAccessToken }));
    } catch (error) {
      next(error);
    };
  };

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.authService.logout(req, res);
      res.status(StatusCode.OK).json(HttpResponse.success({}, "Logget out successfully"));
    } catch (error) {
      next(error);
    };
  };

  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId!;
      const currentUser = await this.authService.getCurrentUser(userId);
      res.status(StatusCode.OK).json(HttpResponse.success(currentUser));
    } catch (error) {
      next(error);
    };
  };

};