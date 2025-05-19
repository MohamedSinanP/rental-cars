import bcrypt from 'bcrypt';
import { inject, injectable } from "inversify";
import IUserService from "../interfaces/services/user.service";
import { AddressDTO, userData, UserResponseDTO, WalleteDTO } from "../types/user";
import TYPES from "../di/types";
import IUserRepository from "../interfaces/repositories/user.repository";
import { HttpError } from "../utils/http.error";
import { PaginatedData, StatusCode } from "../types/types";
import { fetchAddressFromCoordinates } from "../utils/geolocation";
import IAddressRepository from "../interfaces/repositories/address.repository";
import IWalletRepository from "../interfaces/repositories/wallet.repository";
import { Types } from "mongoose";
import { toAddressDTO, toUserDTO } from '../utils/helperFunctions';

@injectable()
export default class UserService implements IUserService {
  constructor(
    @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.IAddressRepository) private _addressRepository: IAddressRepository,
    @inject(TYPES.IWalletRepository) private _walletRepository: IWalletRepository
  ) { };

  async fetchUser(userId: string): Promise<userData> {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new HttpError(StatusCode.UNAUTHORIZED, "User not found");
    };
    return {
      id: user._id.toString(),
      userName: user.userName,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      isVerified: user.isVerified
    };
  };

  async getUserDetails(userId: string): Promise<UserResponseDTO> {
    const user = await this._userRepository.getUserDetails(userId);
    if (!user) {
      throw new HttpError(StatusCode.BAD_REQUEST, "User not found");
    };
    return toUserDTO(user);
  };

  async fetchAllUsers(page: number, limit: number, search: string): Promise<PaginatedData<UserResponseDTO>> {
    const { data, total } = await this._userRepository.findPaginated(page, limit, search);
    if (!data) {
      throw new HttpError(StatusCode.BAD_REQUEST, "User not found");
    };
    const totalPages = Math.ceil(total / limit);
    return {
      data: data.map(toUserDTO),
      totalPages,
      currentPage: page,
    };
  };

  async fetchUserLocationAddresss(lng: number, lat: number): Promise<string> {
    const address = await fetchAddressFromCoordinates(lng, lat);
    return address;
  }

  async setUserLocation(userId: string, location: { type: "Point"; coordinates: [number, number]; address: string; }): Promise<UserResponseDTO> {
    const updatedUser = await this._userRepository.update(userId, { location: location });
    if (!updatedUser) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't update user");
    };
    return toUserDTO(updatedUser);
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

  async blockOrUnblockUser(userId: string): Promise<UserResponseDTO> {
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
    return toUserDTO(updatedUser);
  };

  async getUserAddresses(userId: string): Promise<AddressDTO[]> {
    const addresses = await this._addressRepository.getUserAddresses(userId);
    if (!addresses) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Failed to fetch your address.");
    };
    return addresses.map(toAddressDTO)
  };

  async getUserWallet(userId: string): Promise<WalleteDTO> {
    const userObjId = new Types.ObjectId(userId);
    const wallet = await this._walletRepository.findOne({ userId: userObjId });
    if (!wallet) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Failed to fetch your wallet.");
    };
    return {
      userId: wallet.userId.toString(),
      transactions: wallet.transactions,
      balance: wallet.balance
    };
  };

  async updateUser(userId: string, userName: string, email: string): Promise<Partial<UserResponseDTO>> {
    const updatedUser = await this._userRepository.update(userId, { userName, email });
    if (!updatedUser) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't update your information");
    };
    return {
      userName: updatedUser.userName,
      email: updatedUser.email
    };
  };

  async updatePassword(userId: string, currentPwd: string, newPwd: string): Promise<void> {
    if (!userId || !currentPwd || !newPwd) {
      throw new HttpError(StatusCode.BAD_REQUEST, "User ID, current password, and new password are required");
    }
    if (typeof currentPwd !== 'string' || typeof newPwd !== 'string') {
      throw new HttpError(StatusCode.BAD_REQUEST, "Passwords must be strings");
    }

    const user = await this._userRepository.findById(userId);
    if (!user) throw new HttpError(StatusCode.BAD_REQUEST, "User not found");
    if (!user.password) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Password not set for this user");
    }

    const isMatch = await bcrypt.compare(currentPwd, user.password);
    if (!isMatch) throw new HttpError(StatusCode.BAD_REQUEST, "Current password is incorrect");

    const hashedNewPassword = await bcrypt.hash(newPwd, 10);

    await this._userRepository.update(userId, { password: hashedNewPassword });
  };

  async updateProfilePic(userId: string, profilePic: string): Promise<string> {
    const updatedUser = await this._userRepository.update(userId, { profilePic });
    if (!updatedUser) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't update your profile image");
    };
    return updatedUser.profilePic || "";
  };

};