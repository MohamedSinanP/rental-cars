import { injectable, inject } from "inversify";
import { BaseRepository } from "./base.repository";
import TYPES from "../di/types";
import { Model } from "mongoose";
import { IOwnerModel } from "../types/owner";
import IOwnerRepository from "../interfaces/repositories/owner.repository";
import IOwner from "../types/owner";

@injectable()
export default class OwnerRepository extends BaseRepository<IOwnerModel> implements IOwnerRepository {
  constructor(@inject(TYPES.OwnerModel) private _ownerModel: Model<IOwnerModel>) {
    super(_ownerModel);
  }

  async register(data: IOwner): Promise<IOwnerModel> {
    return await this._ownerModel.create(data);
  }

  async findByEmail(email: string): Promise<IOwnerModel | null> {
    return await this._ownerModel.findOne({ email }).exec();
  }

  async findByEmailAndUpdate(email: string, refreshToken: string): Promise<void> {
    await this._ownerModel.updateOne(
      { email },
      {
        $set: { otp: null, refreshToken, otpExpiresAt: null, isVerified: true }
      }
    ).exec();
  };

  async findPaginated(page: number, limit: number): Promise<{ data: IOwnerModel[]; total: number; }> {
    const skip = (page - 1) * limit;
    const data = await this._ownerModel.find().skip(skip).limit(limit);
    const total = await this._ownerModel.countDocuments();
    return { data, total }
  }
}
