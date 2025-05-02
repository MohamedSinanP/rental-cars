import { inject, injectable } from "inversify";
import IUserController from "../interfaces/controllers/user.controller";
import { LoginResponse, StatusCode } from "../types/types";
import { Request, Response, NextFunction } from "express";
import TYPES from "../di/types";
import IUserService from "../interfaces/services/user.service";
import { HttpResponse } from "../utils/http.response";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export default class UserConroller implements IUserController {
  constructor(@inject(TYPES.IUserService) private _userService: IUserService) { };
  async fetchUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId;
      if (userId) {
        const userDetails = await this._userService.fetchUser(userId);
        res.status(StatusCode.OK).json(HttpResponse.success(userDetails));
      }
    } catch (error) {
      next(error);
    };
  };

  async getUserDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId!;
      const userDetails = await this._userService.getUserDetails(userId);
      res.status(200).json(HttpResponse.success(userDetails));
    } catch (error) {
      next(error);
    };
  };

  async fetchUserLocationAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lng, lat } = req.query;
      const address = await this._userService.fetchUserLocationAddresss(Number(lng), Number(lat));
      res.status(StatusCode.OK).json(HttpResponse.success(address));
    } catch (error) {
      next(error);
    };
  };

  async setUserLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const { location } = req.body;
      const updatedUser = await this._userService.setUserLocation(userId, location);
      res.status(StatusCode.OK).json(HttpResponse.success(updatedUser));
    } catch (error) {
      next(error);
    };
  };

  async fetchUserAddresses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId!;
      const addresses = await this._userService.getUserAddresses(userId);
      res.status(200).json(HttpResponse.success(addresses))
    } catch (error) {
      next(error);
    };
  };

  async getUserWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId!;
      const wallet = await this._userService.getUserWallet(userId);
      res.status(200).json(HttpResponse.success(wallet));
    } catch (error) {
      next(error);
    };
  };
};