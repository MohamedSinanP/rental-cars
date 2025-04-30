import { injectable, inject } from "inversify";
import { BaseRepository } from "./base.repository";
import IUser from "../types/user";
import { IUserModel } from "../models/user.model";
import TYPES from "../di/types";
import IUserRepository from "../interfaces/repositories/user.repository";
import { Model } from "mongoose";

@injectable()
export default class UserRepository extends BaseRepository<IUserModel> implements IUserRepository {
  constructor(@inject(TYPES.UserModel) private userModel: Model<IUserModel>) {
    super(userModel);
  }

  async register(data: IUser): Promise<IUserModel> {
    return await this.userModel.create(data);
  }

  async findByEmail(email: string): Promise<IUserModel | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findByEmailAndUpdate(email: string, refreshToken: string): Promise<void> {
    await this.userModel.updateOne(
      { email },
      {
        $set: { otp: null, refreshToken, otpExpiresAt: null, isVerified: true }
      }
    ).exec();
  };

  async findPaginated(page: number, limit: number): Promise<{ data: IUserModel[]; total: number }> {
    const skip = (page - 1) * limit;
    const data = await this.userModel.find().skip(skip).limit(limit);
    const total = await this.userModel.countDocuments();
    return { data, total };
  };

};
