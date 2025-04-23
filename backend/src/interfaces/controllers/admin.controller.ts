import { NextFunction, Request, Response } from "express";



export default interface IAdminController {
  fetchUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
  fethcOwners(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPendingCars(req: Request, res: Response, next: NextFunction): Promise<void>;
  verifyCar(req: Request, res: Response, next: NextFunction): Promise<void>;
  rejectCar(req: Request, res: Response, next: NextFunction): Promise<void>;
}