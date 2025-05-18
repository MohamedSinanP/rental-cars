import { CarDTO, CarFilter } from "../../types/car";
import ICar from "../../types/car";
import { PaginatedData } from "../../types/types";
import { UploadedFile } from "express-fileupload";



export default interface ICarService {
  fetchCarLocationAddresss(lng: number, lat: number): Promise<string>;
  createCar(data: ICar): Promise<CarDTO>;
  editCar(carId: string, data: Partial<ICar>): Promise<CarDTO>;
  toggleCarListing(ownerId: string, carId: string): Promise<CarDTO>;
  reuploadCarDocs(carId: string, carDocs: {
    rcDoc: UploadedFile;
    insuranceDoc: UploadedFile;
    pucDoc: UploadedFile;
  }): Promise<CarDTO>;
  fetchOwnerVerifedCars(userId: string, page: number, limit: number): Promise<PaginatedData<CarDTO>>;
  fetchOwnerCars(userId: string): Promise<CarDTO[]>;
  fetchCarsWithoutDistance(page: number, limit: number, filters: CarFilter): Promise<PaginatedData<CarDTO>>;
  fetchCarsWithDistance(userId: string, page: number, limit: number, filters: CarFilter): Promise<PaginatedData<CarDTO>>;
  fetchCarDetails(id: string): Promise<CarDTO>;
  fetchSimilarCars(id: string): Promise<CarDTO[]>;
  fetchPendingCars(): Promise<CarDTO[]>;
  verifyCar(carId: string): Promise<CarDTO>;
  rejectCar(carId: string, rejectionReason: string): Promise<CarDTO>;
  getCarDocsDetails(carId: string, userMessage: string): Promise<string>;
  _performOCRFromUrl(url: string): Promise<string>;
  _llmQuery(prompt: string): Promise<string>;
  getMaxPriceAndDistance(): Promise<{ maxPrice: number; maxDistance: number }>;
};