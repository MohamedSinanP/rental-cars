import { injectable, inject } from "inversify";
import { BaseRepository } from "./base.repository";
import IUser from "../types/user";
import { IUserModel } from "../types/user";
import TYPES from "../di/types";
import IUserRepository from "../interfaces/repositories/user.repository";
import { Model } from "mongoose";

@injectable()
export default class UserRepository extends BaseRepository<IUserModel> implements IUserRepository {
  constructor(@inject(TYPES.UserModel) private _userModel: Model<IUserModel>) {
    super(_userModel);
  };

  async register(data: IUser): Promise<IUserModel> {
    return await this._userModel.create(data);
  };

  async countUsers(): Promise<number> {
    return await this._userModel.countDocuments();
  }

  async getUserDetails(userId: string): Promise<IUserModel | null> {
    return await this._userModel.findById(userId).exec();
  };

  async findByEmail(email: string): Promise<IUserModel | null> {
    return await this._userModel.findOne({ email }).exec();
  };

  async findByEmailAndUpdate(email: string, refreshToken: string): Promise<void> {
    await this._userModel.updateOne(
      { email },
      {
        $set: { otp: null, refreshToken, otpExpiresAt: null, isVerified: true }
      }
    ).exec();
  };

  async findPaginated(page: number, limit: number, search: string): Promise<{ data: IUserModel[]; total: number }> {
    const skip = (page - 1) * limit;
    const searchQuery = search
      ? {
        $or: [
          { userName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ]
      }
      : {};

    const data = await this._userModel.find(searchQuery).skip(skip).limit(limit);
    const total = await this._userModel.countDocuments();
    return { data, total };
  };

};
