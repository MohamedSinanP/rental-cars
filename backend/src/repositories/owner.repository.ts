import { injectable, inject } from "inversify";
import { BaseRepository } from "./base.repository";
import TYPES from "../di/types";
import { Model } from "mongoose";
import { IOwnerModel } from "../models/owner.model";
import IOwnerRepository from "../interfaces/owner.repository";
import IOwner from "../types/owner";

@injectable()
export default class OwnerRepository extends BaseRepository<IOwnerModel> implements IOwnerRepository {
  constructor(@inject(TYPES.OwnerModel) private ownerModel: Model<IOwnerModel>) {
    super(ownerModel);
  }

  async register(data: IOwner): Promise<IOwnerModel> {
    return await this.ownerModel.create(data);
  }

  async findByEmail(email: string): Promise<IOwnerModel | null> {
    return await this.ownerModel.findOne({ email }).exec();
  }

  async findByEmailAndUpdate(email: string, refreshToken: string): Promise<void> {
    await this.ownerModel.updateOne(
      { email },
      {
        $set: { otp: null, refreshToken, otpExpiresAt: null, isVerified: true }
      }
    ).exec();
  }
}
