import { inject, injectable } from "inversify";
import IUserService from "../interfaces/user.service";
import { userData } from "../types/user";
import TYPES from "../di/types";
import IUserRepository from "../interfaces/user.repository";
import { HttpError } from "../utils/http.error";


@injectable()
export default class UserService implements IUserService {
  constructor(@inject(TYPES.IUserRepository) private userRepositoy: IUserRepository) { };

  async fetchUser(userId: string): Promise<userData> {
    const user = await this.userRepositoy.findById(userId);
    if (!user) {
      throw new HttpError(401, "User not found");
    };
    return {
      userName: user.userName,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      isVerified: user.isVerified
    };
  };
};