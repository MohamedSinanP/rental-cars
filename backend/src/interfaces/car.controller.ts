import { Request, Response, NextFunction } from "express";
export interface FileUploadRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
  files: {
    rcDoc?: any;
    insuranceDoc?: any;
    pucDoc?: any;
  };
};
export default interface ICarController {
  getAddressFromCoordinates(req: Request, res: Response, next: NextFunction): Promise<void>;
  createCar(req: FileUploadRequest, res: Response, next: NextFunction): Promise<void>;
  fetchOwnerCars(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllCars(req: Request, res: Response, next: NextFunction): Promise<void>;
  carDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
  similarCars(req: Request, res: Response, next: NextFunction): Promise<void>;
};