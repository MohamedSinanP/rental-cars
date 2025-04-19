import { inject, injectable } from "inversify";
import IUserController from "../interfaces/user.controller";
import { LoginResponse } from "../types/types";
import { Request, Response, NextFunction } from "express";
import TYPES from "../di/types";
import IUserService from "../interfaces/user.service";
import { HttpResponse } from "../utils/http.response";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export default class UserConroller implements IUserController {
  constructor(@inject(TYPES.IUserService) private userSerive: IUserService) { };
  async fetchUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId;
      if (userId) {
        const userDetails = await this.userSerive.fetchUser(userId);
        res.status(200).json(HttpResponse.success(userDetails));
      }
    } catch (error) {
      next(error);
    };
  };
};