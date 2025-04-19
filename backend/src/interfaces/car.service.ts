import { ICarModel } from "../types/car";
import ICar from "../types/car";



export default interface ICarService {
  fetchAddressFromCoordinates(lng: number, lat: number): Promise<string>;
  createCar(data: ICar): Promise<ICarModel>;
  fetchOwnerCars(userId: string): Promise<ICarModel[]>;
  fetchAllCars(): Promise<ICarModel[]>;
  fetchCarDetails(id: string): Promise<ICarModel>;
  fetchSimilarCars(id: string): Promise<ICarModel[]>;
};