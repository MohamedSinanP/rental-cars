import { IOwnerModel } from "../models/owner.model";

export default interface IOwnerService {
  getAllOwners(): Promise<IOwnerModel[]>;
}