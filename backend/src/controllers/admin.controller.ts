import { inject, injectable } from "inversify";
import IAdminController from "../interfaces/controllers/admin.controller";
import { Request, Response, NextFunction } from "express";
import TYPES from "../di/types";
import IUserService from "../interfaces/services/user.service";
import { HttpResponse } from "../utils/http.response";
import IOwnerService from "../interfaces/services/owner.service";
import ICarService from "../interfaces/services/car.service";
import { StatusCode } from "../types/types";


@injectable()
export default class AdminController implements IAdminController {
  constructor(
    @inject(TYPES.IUserService) private userService: IUserService,
    @inject(TYPES.IOwnerService) private ownerService: IOwnerService,
    @inject(TYPES.ICarService) private carService: ICarService
  ) { };

  async fetchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      const users = await this.userService.fetchAllUsers(page, limit);
      res.status(StatusCode.OK).json(HttpResponse.success(users));
    } catch (error) {
      next(error);
    };
  };

  async fethcOwners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      const owners = await this.ownerService.getAllOwners(page, limit);
      res.status(StatusCode.OK).json(HttpResponse.success(owners));
    } catch (error) {
      next(error);
    };
  };

  async getPendingCars(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pendingCars = await this.carService.fetchPendingCars();
      res.status(StatusCode.OK).json(HttpResponse.success(pendingCars))
    } catch (error) {
      next(error);
    };
  };

  async verifyCar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const carId = req.params.id;
      const car = await this.carService.verifyCar(carId);
      res.status(StatusCode.OK).json(HttpResponse.success(car));
    } catch (error) {
      next(error);
    };
  };

  async rejectCar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("hehehehe");

      const carId = req.params.id;
      const { rejectionReason } = req.body;
      const car = await this.carService.rejectCar(carId, rejectionReason);
      res.status(StatusCode.OK).json(HttpResponse.success(car));
    } catch (error) {
      next(error);
    };
  };

  async blockOrUnblockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const blockedUser = await this.userService.blockOrUnblockUser(userId);
      res.status(StatusCode.OK).json(HttpResponse.success(blockedUser));
    } catch (error) {
      next(error);
    };
  };

  async blockOrUnblockOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.params.id;
      const blockedOwner = await this.ownerService.blockOrUnblockOwner(ownerId);
      res.status(StatusCode.OK).json(HttpResponse.success(blockedOwner));
    } catch (error) {
      next(error);
    };
  };
};