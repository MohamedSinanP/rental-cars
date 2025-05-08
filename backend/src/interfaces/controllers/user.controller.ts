import { NextFunction, Request, Response } from "express";

export default interface IUserController {
  fetchUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUserDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
  fetchUserLocationAddress(req: Request, res: Response, next: NextFunction): Promise<void>;
  setUserLocation(req: Request, res: Response, next: NextFunction): Promise<void>;
  fetchUserAddresses(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUserWallet(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
  updatePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
  uploadImage(req: Request, res: Response, next: NextFunction): Promise<void>;
}