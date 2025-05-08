import { IUserModel } from "../../types/user";
import { PaginatedData } from "../../types/types";
import IUser, { IAddressModel, IWalletModel, userData } from "../../types/user";



export default interface IUserService {
  fetchUser(userId: string): Promise<userData>;
  getUserDetails(usreId: string): Promise<IUserModel>;
  fetchAllUsers(page: number, limit: number, search: string): Promise<PaginatedData<IUserModel>>;
  fetchUserLocationAddresss(lng: number, lat: number): Promise<string>;
  setUserLocation(userId: string, location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  }): Promise<userData>;
  getUserLocation(userId: string): Promise<[number, number] | undefined>;
  blockOrUnblockUser(userId: string): Promise<IUserModel>;
  getUserAddresses(userId: string): Promise<IAddressModel[]>;
  getUserWallet(userId: string): Promise<IWalletModel>;
  updateUser(userId: string, userName: string, email: string): Promise<Partial<IUserModel>>;
  updatePassword(userId: string, currentPwd: string, newPwd: string): Promise<void>;
  updateProfilePic(userId: string, profilePic: string): Promise<string>;
};