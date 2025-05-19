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
  };

  async register(data: IOwner): Promise<IOwnerModel> {
    return await this._ownerModel.create(data);
  };

  async countOwners(): Promise<number> {
    return await this._ownerModel.countDocuments();
  }

  async findByEmail(email: string): Promise<IOwnerModel | null> {
    return await this._ownerModel.findOne({ email }).exec();
  };

  async findPaginated(page: number, limit: number, search: string): Promise<{ data: IOwnerModel[]; total: number; }> {
    const skip = (page - 1) * limit;
    const searchQuery = search
      ? {
        $or: [
          { userName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ]
      }
      : {};

    const data = await this._ownerModel.find(searchQuery).skip(skip).limit(limit);
    const total = await this._ownerModel.countDocuments();
    return { data, total }
  }
}
