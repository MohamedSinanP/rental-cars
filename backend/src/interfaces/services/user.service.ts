import { IUserModel } from "../../models/user.model";
import { PaginatedData } from "../../types/types";
import IUser, { userData } from "../../types/user";



export default interface IUserService {
  fetchUser(userId: string): Promise<userData>;
  fetchAllUsers(page: number, limit: number): Promise<PaginatedData<IUserModel>>;
  fetchUserLocationAddresss(lng: number, lat: number): Promise<string>;
  setUserLocation(userId: string, location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  }): Promise<userData>;
}