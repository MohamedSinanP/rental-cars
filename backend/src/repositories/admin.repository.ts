import { inject, injectable } from "inversify";
import IAdminRepository from "../interfaces/repositories/admin.repository";
import { IAdminModel } from "../models/admin.model";
import { BaseRepository } from "./base.repository";
import TYPES from "../di/types";
import { Model } from "mongoose";


@injectable()
export default class AdminRepository extends BaseRepository<IAdminModel> implements IAdminRepository {
  constructor(@inject(TYPES.AdminModel) private _adminModel: Model<IAdminModel>) {
    super(_adminModel)
  };
  async findByEmail(email: string): Promise<IAdminModel | null> {
    return await this._adminModel.findOne({ email }).exec();
  };
};