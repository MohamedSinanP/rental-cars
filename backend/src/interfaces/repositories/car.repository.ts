import { ICarModel } from "../../types/car";
import IBaseRepository from "./base.repository";
import ICar from "../../types/car";

export default interface ICarRepository extends IBaseRepository<ICarModel> {
  addCar(data: ICar): Promise<ICarModel>;
  editCar(carId: string, data: Partial<ICar>): Promise<ICarModel>;
  findByOwner(userId: string): Promise<ICarModel[]>;
  findPaginated(page: number, limit: number): Promise<{ data: ICarModel[]; total: number }>;
}
