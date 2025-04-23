import { IUserModel } from "../../models/user.model";
import IBaseRepository from "./base.repository";
import IUser, { IUserGoogle } from "../../types/user";

export default interface IUserRepository extends IBaseRepository<IUserModel> {
  register(data: IUser | IUserGoogle): Promise<IUserModel>;
  findByEmail(email: string): Promise<IUserModel | null>;
  findByEmailAndUpdate(email: string, refreshToken: string): Promise<void>;
  findPaginated(page: number, limit: number): Promise<{ data: IUserModel[]; total: number }>;
}
