import { IOwnerModel } from "../../types/owner";
import IBaseRepository from "./base.repository";
import IOwner from "../../types/owner";

export default interface IOwnerRepository extends IBaseRepository<IOwnerModel> {
  register(data: IOwner): Promise<IOwnerModel>;
  countOwners(): Promise<number>;
  findByEmail(email: string): Promise<IOwnerModel | null>;
  findPaginated(page: number, limit: number, search: string): Promise<{ data: IOwnerModel[]; total: number }>;
}
