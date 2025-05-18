import { AddressDTO, UserResponseDTO, WalleteDTO } from "../../types/user";
import { PaginatedData } from "../../types/types";
import { userData } from "../../types/user";



export default interface IUserService {
  fetchUser(userId: string): Promise<userData>;
  getUserDetails(usreId: string): Promise<UserResponseDTO>;
  fetchAllUsers(page: number, limit: number, search: string): Promise<PaginatedData<UserResponseDTO>>;
  fetchUserLocationAddresss(lng: number, lat: number): Promise<string>;
  setUserLocation(userId: string, location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  }): Promise<UserResponseDTO>;
  getUserLocation(userId: string): Promise<[number, number] | undefined>;
  blockOrUnblockUser(userId: string): Promise<UserResponseDTO>;
  getUserAddresses(userId: string): Promise<AddressDTO[]>;
  getUserWallet(userId: string): Promise<WalleteDTO>;
  updateUser(userId: string, userName: string, email: string): Promise<Partial<UserResponseDTO>>;
  updatePassword(userId: string, currentPwd: string, newPwd: string): Promise<void>;
  updateProfilePic(userId: string, profilePic: string): Promise<string>;
};