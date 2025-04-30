import { IAddress, IAddressModel } from "../../types/user";
import IBaseRepository from "./base.repository";


export default interface IAddressRepository extends IBaseRepository<IAddressModel> {
  addNewAddress(data: IAddress): Promise<IAddressModel | null>;
  getUserAddresses(userId: string): Promise<IAddressModel[] | null>;

};