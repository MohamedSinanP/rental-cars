import axios from "axios";
import { inject } from "inversify";
import ICarService from "../interfaces/car.service";
import { ICarModel } from "../types/car";
import ICar from "../types/car";
import TYPES from "../di/types";
import ICarRepository from "../interfaces/car.repository";
import { UploadedFile } from "express-fileupload";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";
import { HttpError } from "../utils/http.error";

export default class CarService implements ICarService {
  constructor(@inject(TYPES.ICarRepository) private carRepository: ICarRepository) { }

  async fetchAddressFromCoordinates(lng: number, lat: number): Promise<string> {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse`,
        {
          params: {
            lat,
            lon: lng,
            format: "json",
          },
          headers: {
            "User-Agent": "YourAppName/1.0 (your@email.com)",
          },
        }
      );

      if (!response.data?.display_name) {
        throw new HttpError(404, "No address found.");
      }

      return response.data.display_name;
    } catch (error) {
      console.error("Error calling OpenStreetMap:", error);
      throw new HttpError(404, "Unable to fetch address from coordinates.");
    }
  }


  async createCar(data: ICar & {
    rcDoc: UploadedFile;
    insuranceDoc: UploadedFile;
    pucDoc: UploadedFile;
  }): Promise<ICarModel> {

    // upload all the docs to the cloudinary
    const rcDocUrl = await uploadToCloudinary(data.rcDoc.tempFilePath, "documents");
    const insuranceDocUrl = await uploadToCloudinary(data.insuranceDoc.tempFilePath, "documents");
    const pucDocUrl = await uploadToCloudinary(data.pucDoc.tempFilePath, "documents");

    const carToAdd: ICar = {
      ...data,
      rcDoc: rcDocUrl,
      insuranceDoc: insuranceDocUrl,
      pucDoc: pucDocUrl
    }

    return await this.carRepository.addCar(carToAdd);
  };

  async fetchOwnerCars(userId: string): Promise<ICarModel[]> {
    const cars = await this.carRepository.findByOwner(userId);
    if (!cars) {
      throw new HttpError(401, "Can't find cars with your details.")
    }
    return cars;
  };

  async fetchAllCars(): Promise<ICarModel[]> {
    const cars = await this.carRepository.findAll();
    if (!cars) {
      throw new HttpError(404, "Can't get the cars.")
    };
    return cars;
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
};
