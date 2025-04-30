import { NextFunction, Request, Response } from "express";

export default interface IUserController {
  fetchUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  fetchUserLocationAddress(req: Request, res: Response, next: NextFunction): Promise<void>;
  setUserLocation(req: Request, res: Response, next: NextFunction): Promise<void>;
  fetchUserAddresses(req: Request, res: Response, next: NextFunction): Promise<void>;
}