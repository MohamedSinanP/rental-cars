import { inject, injectable } from "inversify";
import IUserService from "../interfaces/services/user.service";
import { userData } from "../types/user";
import TYPES from "../di/types";
import IUserRepository from "../interfaces/repositories/user.repository";
import { HttpError } from "../utils/http.error";
import { IUserModel } from "../models/user.model";
import { PaginatedData } from "../types/types";
import { fetchAddressFromCoordinates } from "../utils/geoLocation";


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

  async fetchAllUsers(page: number, limit: number): Promise<PaginatedData<IUserModel>> {
    const { data, total } = await this.userRepositoy.findPaginated(page, limit);
    if (!data) {
      throw new HttpError(401, "User not found");
    };
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      totalPages,
      currentPage: page,
    };
  };

  async fetchUserLocationAddresss(lng: number, lat: number): Promise<string> {
    const address = await fetchAddressFromCoordinates(lng, lat);
    return address;
  }

  async setUserLocation(userId: string, location: { type: "Point"; coordinates: [number, number]; address: string; }): Promise<userData> {
    const updatedUser = await this.userRepositoy.update(userId, { location: location });
    if (!updatedUser) {
      throw new HttpError(400, "Can't update user");
    };
    return {
      userName: updatedUser.userName,
      email: updatedUser.email,
      isBlocked: updatedUser.isBlocked,
      isVerified: updatedUser.isVerified,
      location: updatedUser.location
    };
  };
};