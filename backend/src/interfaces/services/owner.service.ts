import { IOwnerModel } from "../../models/owner.model";
import { PaginatedData } from "../../types/types";

export default interface IOwnerService {
  getAllOwners(page: number, limit: number): Promise<PaginatedData<IOwnerModel>>;
  blockOrUnblockOwner(ownerId: string): Promise<IOwnerModel>;
}