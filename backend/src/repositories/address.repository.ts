import { inject, injectable } from "inversify";
import IAdminRepository from "../interfaces/repositories/admin.repository";
import { IAdminModel } from "../models/admin.model";
import { BaseRepository } from "./base.repository";
import TYPES from "../di/types";
import { Model } from "mongoose";
import { IAddress, IAddressModel } from "../types/user";
import IAddressRepository from "../interfaces/repositories/address.repository";


@injectable()
export default class AddressRepository extends BaseRepository<IAddressModel> implements IAddressRepository {
  constructor(@inject(TYPES.AddressModel) private _addressModel: Model<IAddressModel>) {
    super(_addressModel)
  };
  async addNewAddress(data: IAddress): Promise<IAddressModel | null> {
    return await this._addressModel.create(data);
  };

  async getUserAddresses(userId: string): Promise<IAddressModel[] | null> {
    return await this._addressModel.find({ userId: userId });
  };

};