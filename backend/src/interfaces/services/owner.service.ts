import { IOwnerModel, OwnerResponseDTO } from "../../types/owner";
import { PaginatedData } from "../../types/types";

export default interface IOwnerService {
  getAllOwners(page: number, limit: number, search: string): Promise<PaginatedData<OwnerResponseDTO>>;
  blockOrUnblockOwner(ownerId: string): Promise<OwnerResponseDTO>;
}