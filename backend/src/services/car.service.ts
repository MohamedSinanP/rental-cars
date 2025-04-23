import axios from "axios";
import { inject } from "inversify";
import ICarService from "../interfaces/services/car.service";
import { ICarModel } from "../types/car";
import ICar from "../types/car";
import TYPES from "../di/types";
import ICarRepository from "../interfaces/repositories/car.repository";
import { UploadedFile } from "express-fileupload";
import { uploadPDFToCloudinary } from "../utils/uploadToCloudinary";
import { HttpError } from "../utils/http.error";
import { PaginatedData } from "../types/types";
import { fetchAddressFromCoordinates } from "../utils/geoLocation";
import { Types } from "mongoose";

export default class CarService implements ICarService {
  constructor(@inject(TYPES.ICarRepository) private carRepository: ICarRepository) { }

  async fetchCarLocationAddresss(lng: number, lat: number): Promise<string> {
    const address = await fetchAddressFromCoordinates(lng, lat);
    return address;
  }


  async createCar(data: ICar & {
    rcDoc: UploadedFile;
    insuranceDoc: UploadedFile;
    pucDoc: UploadedFile;
  }): Promise<ICarModel> {

    // upload all the docs to the cloudinary
    const rcDocUrl = await uploadPDFToCloudinary(data.rcDoc, "documents");
    const insuranceDocUrl = await uploadPDFToCloudinary(data.insuranceDoc, "documents");
    const pucDocUrl = await uploadPDFToCloudinary(data.pucDoc, "documents");

    const carToAdd: ICar = {
      ...data,
      rcDoc: rcDocUrl,
      insuranceDoc: insuranceDocUrl,
      pucDoc: pucDocUrl
    }

    return await this.carRepository.addCar(carToAdd);
  };

  async editCar(carId: string, data: Partial<ICar> & {
    rcDoc?: UploadedFile;
    insuranceDoc?: UploadedFile;
    pucDoc?: UploadedFile;
  }): Promise<ICarModel> {
    const carToEdit: Partial<ICar> = { ...data };

    if (data.rcDoc) {
      const rcDocUrl = await uploadPDFToCloudinary(data.rcDoc, "documents");
      carToEdit.rcDoc = rcDocUrl;
      delete carToEdit.rcDoc;
    }

    if (data.insuranceDoc) {
      const insuranceDocUrl = await uploadPDFToCloudinary(data.insuranceDoc, "documents");
      carToEdit.insuranceDoc = insuranceDocUrl;
      delete carToEdit.insuranceDoc;
    }

    if (data.pucDoc) {
      const pucDocUrl = await uploadPDFToCloudinary(data.pucDoc, "documents");
      carToEdit.pucDoc = pucDocUrl;
      delete carToEdit.pucDoc;
    }

    return await this.carRepository.editCar(carId, carToEdit);
  }

  async fetchOwnerVerifedCars(userId: string): Promise<ICarModel[]> {
    const cars = await this.carRepository.findByOwner(userId);
    if (!cars) {
      throw new HttpError(401, "Can't find cars with your details.")
    }
    return cars;
  };

  async fetchOwnerCars(userId: string): Promise<ICarModel[]> {
    const cars = await this.carRepository.findAll({ ownerId: userId });
    if (!cars) {
      throw new HttpError(401, "Can't find cars with your details.")
    }
    return cars;
  };

  async fetchAllCars(page: number, limit: number): Promise<PaginatedData<ICarModel>> {
    const { data, total } = await this.carRepository.findPaginated(page, limit);
    if (!data) {
      throw new HttpError(404, "Can't get the cars.")
    };
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      totalPages,
      currentPage: page,
    };
  };

  async fetchCarDetails(id: string): Promise<ICarModel> {
    const car = await this.carRepository.findById(id);
    if (!car) {
      throw new HttpError(404, "Can't get the cars.");
    };
    return car;
  };

  async fetchSimilarCars(id: string): Promise<ICarModel[]> {
    const car = await this.carRepository.findById(id);
    if (!car) {
      throw new HttpError(404, "Can't get the cars.");
    }
    const type = car?.carType;
    const cars = await this.carRepository.findAll({ carType: type });
    return cars
  };

  async fetchPendingCars(): Promise<ICarModel[]> {
    const cars = await this.carRepository.findAll({
      isVerified: false,
      verificationRejected: false,
    });
    if (!cars) {
      throw new HttpError(404, "Can't get the cars.");
    }
    return cars;
  };

  async verifyCar(carId: string): Promise<ICarModel> {
    const updatedCar = await this.carRepository.update(String(carId), { isVerified: true });
    if (!updatedCar) {
      throw new HttpError(404, "Can't update car details");
    }
    return updatedCar;
  };

  async rejectCar(carId: string, rejectionReason: string): Promise<ICarModel> {
    const updatedCar = await this.carRepository.update(String(carId), {
      verificationRejected: true,
      rejectionReason
    });
    if (!updatedCar) {
      throw new HttpError(404, "Can't update car details");
    }
    return updatedCar;
  }
};
