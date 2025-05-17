import { CarFilter, ICarModel } from "../../types/car";
import ICar from "../../types/car";
import { PaginatedData } from "../../types/types";
import { UploadedFile } from "express-fileupload";



export default interface ICarService {
  fetchCarLocationAddresss(lng: number, lat: number): Promise<string>;
  createCar(data: ICar): Promise<ICarModel>;
  editCar(carId: string, data: Partial<ICar>): Promise<ICarModel>;
  reuploadCarDocs(carId: string, carDocs: {
    rcDoc: UploadedFile;
    insuranceDoc: UploadedFile;
    pucDoc: UploadedFile;
  }): Promise<ICarModel>;
  fetchOwnerVerifedCars(userId: string, page: number, limit: number): Promise<PaginatedData<ICarModel>>;
  fetchOwnerCars(userId: string): Promise<ICarModel[]>;
  fetchCarsWithoutDistance(page: number, limit: number, filters: CarFilter): Promise<PaginatedData<ICarModel>>;
  fetchCarsWithDistance(userId: string, page: number, limit: number, filters: CarFilter): Promise<PaginatedData<ICarModel>>;
  fetchCarDetails(id: string): Promise<ICarModel>;
  fetchSimilarCars(id: string): Promise<ICarModel[]>;
  fetchPendingCars(): Promise<ICarModel[]>;
  verifyCar(carId: string): Promise<ICarModel>;
  rejectCar(carId: string, rejectionReason: string): Promise<ICarModel>;
  getCarDocsDetails(carId: string, userMessage: string): Promise<string>;
  _performOCRFromUrl(url: string): Promise<string>;
  _llmQuery(prompt: string): Promise<string>;
  getMaxPriceAndDistance(): Promise<{ maxPrice: number; maxDistance: number }>;
};