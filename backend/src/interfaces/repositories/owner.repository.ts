import { IOwnerModel } from "../../types/owner";
import IBaseRepository from "./base.repository";
import IOwner from "../../types/owner";

export default interface IOwnerRepository extends IBaseRepository<IOwnerModel> {
  register(data: IOwner): Promise<IOwnerModel>;
  findByEmail(email: string): Promise<IOwnerModel | null>;
  findByEmailAndUpdate(email: string, refreshToken: string): Promise<void>;
  findPaginated(page: number, limit: number): Promise<{ data: IOwnerModel[]; total: number }>;

}
