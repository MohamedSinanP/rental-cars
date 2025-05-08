import { inject, injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import { ICarModel } from "../types/car";
import ICarRepository from "../interfaces/repositories/car.repository";
import ICar from "../types/car";
import TYPES from "../di/types";
import { Model } from "mongoose";
import { HttpError } from "../utils/http.error";
import { StatusCode } from "../types/types";


@injectable()
export class CarRepository extends BaseRepository<ICarModel> implements ICarRepository {

  constructor(@inject(TYPES.CarModel) private _carModel: Model<ICarModel>) {
    super(_carModel);
  };
  async addCar(data: ICar): Promise<ICarModel> {
    return await this._carModel.create(data);
  };

  async countCars(ownerId: string): Promise<number> {
    return await this._carModel.find({ ownerId }).countDocuments();
  }

  async editCar(carId: string, data: ICar): Promise<ICarModel> {
    const updatedCar = await this._carModel.findByIdAndUpdate(carId, data, { new: true });
    if (!updatedCar) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't update car data");
    }
    return updatedCar;
  };

  async findByOwner(ownerId: string, page: number, limit: number): Promise<{ data: ICarModel[]; total: number; }> {
    const skip = (page - 1) * limit;
    const data = await this._carModel.find({ ownerId: ownerId })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
    const total = await this._carModel.countDocuments();
    return {
      data,
      total
    }

  };

  async findPaginated(page: number, limit: number): Promise<{ data: ICarModel[]; total: number; }> {
    const skip = (page - 1) * limit;
    const data = await this._carModel.find().skip(skip).limit(limit);
    const total = await this._carModel.countDocuments();
    return { data, total };
  };

  async findPaginatedWithDistance(userLocation: [number, number], page: number, limit: number) {
    const skip = (page - 1) * limit;

    const result = await this._carModel.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: userLocation },
          distanceField: "distance",
          spherical: true,
          query: { isVerified: true }
        }
      },
      {
        $set: {
          distance: { $divide: ["$distance", 1000] }
        }
      },
      {
        $sort: { distance: 1 }
      },
      { $skip: skip },
      { $limit: limit }
    ]);

    const total = await this._carModel.countDocuments({ isValid: true });
    return { data: result, total };
  };

  async getCarDocumentsById(carId: string) {
    const car = await this._carModel.findById(carId);
    if (!car) throw new HttpError(StatusCode.BAD_REQUEST, 'Car not found');

    return {
      rcUrl: car.rcDoc,
      pucUrl: car.pucDoc,
      insuranceUrl: car.insuranceDoc,
    };
  };
};