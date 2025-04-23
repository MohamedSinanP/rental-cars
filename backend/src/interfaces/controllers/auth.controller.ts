import { NextFunction, Request, Response } from "express"
export default interface IAuthController {
  signupUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  signupOwner(req: Request, res: Response, next: NextFunction): Promise<void>;
  adminLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  handleGoogleCallback(req: Request, res: Response, next: NextFunction): Promise<void>;
  verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
  resendOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
  verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
  verifyResetOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
  resetPwd(req: Request, res: Response, next: NextFunction): Promise<void>;
  logout(req: Request, res: Response, next: NextFunction): Promise<void>;
  getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void>;

}