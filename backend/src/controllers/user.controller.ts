import { inject, injectable } from "inversify";
import IUserController from "../interfaces/controllers/user.controller";
import { LoginResponse } from "../types/types";
import { Request, Response, NextFunction } from "express";
import TYPES from "../di/types";
import IUserService from "../interfaces/services/user.service";
import { HttpResponse } from "../utils/http.response";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export default class UserConroller implements IUserController {
  constructor(@inject(TYPES.IUserService) private userService: IUserService) { };
  async fetchUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId;
      if (userId) {
        const userDetails = await this.userService.fetchUser(userId);
        res.status(200).json(HttpResponse.success(userDetails));
      }
    } catch (error) {
      next(error);
    };
  };

  async fetchUserLocationAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lng, lat } = req.query;
      const address = await this.userService.fetchUserLocationAddresss(Number(lng), Number(lat));
      res.status(200).json(HttpResponse.success(address));
    } catch (error) {
      next(error);
    };
  };

  async setUserLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId!;
      const { location } = req.body;
      const updatedUser = await this.userService.setUserLocation(userId, location);
      res.status(200).json(HttpResponse.success(updatedUser));
    } catch (error) {
      next(error);
    };
  };
};