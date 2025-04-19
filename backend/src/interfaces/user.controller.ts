import { NextFunction, Request, Response } from "express";
import { LoginResponse } from "../types/types";

export default interface IUserController {
  fetchUser(req: Request, res: Response, next: NextFunction): Promise<void>;
}