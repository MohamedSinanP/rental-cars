import { IAdminModel } from "../../models/admin.model";
import IBaseRepository from "./base.repository";


export default interface IAdminRepository extends IBaseRepository<IAdminModel> {
  findByEmail(email: string): Promise<IAdminModel | null>;

};