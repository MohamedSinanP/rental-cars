import { inject, injectable } from "inversify";
import IUserService from "../interfaces/services/user.service";
import { IAddressModel, userData } from "../types/user";
import TYPES from "../di/types";
import IUserRepository from "../interfaces/repositories/user.repository";
import { HttpError } from "../utils/http.error";
import { IUserModel } from "../models/user.model";
import { PaginatedData, StatusCode } from "../types/types";
import { fetchAddressFromCoordinates } from "../utils/geolocation";
import IAddressRepository from "../interfaces/repositories/address.repository";

@injectable()
export default class UserService implements IUserService {
  constructor(
    @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.IAddressRepository) private _addressRepository: IAddressRepository

  ) { };

  async fetchUser(userId: string): Promise<userData> {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new HttpError(StatusCode.UNAUTHORIZED, "User not found");
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
    const { data, total } = await this._userRepository.findPaginated(page, limit);
    if (!data) {
      throw new HttpError(StatusCode.UNAUTHORIZED, "User not found");
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
    const updatedUser = await this._userRepository.update(userId, { location: location });
    if (!updatedUser) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't update user");
    };
    return {
      userName: updatedUser.userName,
      email: updatedUser.email,
      isBlocked: updatedUser.isBlocked,
      isVerified: updatedUser.isVerified,
      location: updatedUser.location
    };
  };

  async getUserLocation(userId: string): Promise<[number, number]> {
    const user = await this._userRepository.findById(userId);

    if (!user) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find user");
    }

    if (!user.location || !Array.isArray(user.location.coordinates)) {
      throw new HttpError(StatusCode.BAD_REQUEST, "User location is not set properly");
    }

    return user.location.coordinates as [number, number];
  };

  async blockOrUnblockUser(userId: string): Promise<IUserModel> {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find user");
    }

    const updatedUser = await this._userRepository.update(userId, {
      isBlocked: !user.isBlocked,
    });

    if (!updatedUser) {
      throw new HttpError(StatusCode.INTERNAL_SERVER_ERROR, "Failed to block user");
    }
    return updatedUser;
  };

  async getUserAddresses(userId: string): Promise<IAddressModel[]> {
    const addresses = await this._addressRepository.getUserAddresses(userId);
    if (!addresses) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Failed to fetch your address.");
    };
    return addresses
  }

};