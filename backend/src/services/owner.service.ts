import { inject, injectable } from "inversify";
import IOwnerService from "../interfaces/services/owner.service";
import TYPES from "../di/types";
import IOwnerRepository from "../interfaces/repositories/owner.repository";
import { IOwnerModel } from "../types/owner";
import { HttpError } from "../utils/http.error";
import { PaginatedData, StatusCode } from "../types/types";

@injectable()
export default class OwnerService implements IOwnerService {

  constructor(@inject(TYPES.IOwnerRepository) private _ownerRepository: IOwnerRepository) { };

  async getAllOwners(page: number, limit: number): Promise<PaginatedData<IOwnerModel>> {
    const { data, total } = await this._ownerRepository.findPaginated(page, limit);
    if (!data) {
      throw new HttpError(StatusCode.UNAUTHORIZED, "User not found");
    };
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      totalPages,
      currentPage: page,
    };
  };

  async blockOrUnblockOwner(ownerId: string): Promise<IOwnerModel> {
    const user = await this._ownerRepository.findById(ownerId);
    if (!user) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find user");
    };

    const updatedUser = await this._ownerRepository.update(ownerId, {
      isBlocked: !user.isBlocked,
    });

    if (!updatedUser) {
      throw new HttpError(StatusCode.INTERNAL_SERVER_ERROR, "Failed to block user");
    }
    return updatedUser;
  };
};