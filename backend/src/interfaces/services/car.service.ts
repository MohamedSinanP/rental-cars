import { ICarModel } from "../../types/car";
import ICar from "../../types/car";
import { PaginatedData } from "../../types/types";



export default interface ICarService {
  fetchCarLocationAddresss(lng: number, lat: number): Promise<string>;
  createCar(data: ICar): Promise<ICarModel>;
  editCar(carId: string, data: Partial<ICar>): Promise<ICarModel>;
  fetchOwnerVerifedCars(userId: string): Promise<ICarModel[]>;
  fetchOwnerCars(userId: string): Promise<ICarModel[]>;
  fetchAllCars(page: number, limit: number): Promise<PaginatedData<ICarModel>>;
  fetchCarDetails(id: string): Promise<ICarModel>;
  fetchSimilarCars(id: string): Promise<ICarModel[]>;
  fetchPendingCars(): Promise<ICarModel[]>;
  verifyCar(carId: string): Promise<ICarModel>;
  rejectCar(carId: string, rejectionReason: string): Promise<ICarModel>;
};