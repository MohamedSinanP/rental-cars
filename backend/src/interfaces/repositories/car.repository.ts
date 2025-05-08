import { ICarModel } from "../../types/car";
import IBaseRepository from "./base.repository";
import ICar from "../../types/car";

export default interface ICarRepository extends IBaseRepository<ICarModel> {
  addCar(data: ICar): Promise<ICarModel>;
  countCars(ownerId: string): Promise<number>;
  editCar(carId: string, data: Partial<ICar>): Promise<ICarModel>;
  findByOwner(userId: string, page: number, limit: number): Promise<{ data: ICarModel[]; total: number; }>;
  findPaginated(page: number, limit: number): Promise<{ data: ICarModel[]; total: number }>;
  findPaginatedWithDistance(userLocation: [number, number], page: number, limit: number): Promise<{ data: ICarModel[]; total: number }>;
  getCarDocumentsById(carId: string): Promise<{
    rcUrl: string,
    pucUrl: string,
    insuranceUrl: string,
  }>;
};
