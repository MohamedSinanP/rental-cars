import { ICarModel } from "../types/car";
import IBaseRepository from "./base.repository";
import ICar from "../types/car";

export default interface ICarRepository extends IBaseRepository<ICarModel> {
  addCar(data: ICar): Promise<ICarModel>;
  findByOwner(userId: string): Promise<ICarModel[]>;
}
