import { IOwnerModel } from "../../types/owner";
import { PaginatedData } from "../../types/types";

export default interface IOwnerService {
  getAllOwners(page: number, limit: number, search: string): Promise<PaginatedData<IOwnerModel>>;
  blockOrUnblockOwner(ownerId: string): Promise<IOwnerModel>;
}