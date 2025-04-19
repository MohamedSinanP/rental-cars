import { IOwnerModel } from "../models/owner.model";
import IBaseRepository from "./base.repository";
import IOwner from "../types/owner";

export default interface IOwnerRepository extends IBaseRepository<IOwnerModel> {
  register(data: IOwner): Promise<IOwnerModel>;
  findByEmail(email: string): Promise<IOwnerModel | null>;
  findByEmailAndUpdate(email: string, refreshToken: string): Promise<void>;
}
