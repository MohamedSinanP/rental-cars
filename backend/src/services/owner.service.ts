import { inject, injectable } from "inversify";
import IOwnerService from "../interfaces/services/owner.service";
import TYPES from "../di/types";
import IOwnerRepository from "../interfaces/repositories/owner.repository";
import { IOwnerModel } from "../models/owner.model";
import { HttpError } from "../utils/http.error";

@injectable()
export default class OwnerService implements IOwnerService {

  constructor(@inject(TYPES.IOwnerRepository) private ownerRepository: IOwnerRepository) { };

  async getAllOwners(): Promise<IOwnerModel[]> {
    const owners = await this.ownerRepository.findAll();
    if (!owners) {
      throw new HttpError(401, "User not found");
    };
    return owners;
  }

}