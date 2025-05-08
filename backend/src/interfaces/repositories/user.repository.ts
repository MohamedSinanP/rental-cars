import { IUserModel } from "../../types/user";
import IBaseRepository from "./base.repository";
import IUser, { IUserGoogle } from "../../types/user";

export default interface IUserRepository extends IBaseRepository<IUserModel> {
  register(data: IUser | IUserGoogle): Promise<IUserModel>;
  countUsers(): Promise<number>;
  getUserDetails(userId: string): Promise<IUserModel | null>;
  findByEmail(email: string): Promise<IUserModel | null>;
  findByEmailAndUpdate(email: string, refreshToken: string): Promise<void>;
  findPaginated(page: number, limit: number, search: string): Promise<{ data: IUserModel[]; total: number }>;
};
