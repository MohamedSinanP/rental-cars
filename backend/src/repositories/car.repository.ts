import { inject, injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import { ICarModel } from "../types/car";
import ICarRepository from "../interfaces/repositories/car.repository";
import ICar from "../types/car";
import TYPES from "../di/types";
import { Model } from "mongoose";
import { HttpError } from "../utils/http.error";


@injectable()
export class CarRepository extends BaseRepository<ICarModel> implements ICarRepository {

  constructor(@inject(TYPES.CarModel) private carModel: Model<ICarModel>) {
    super(carModel);
  };
  async addCar(data: ICar): Promise<ICarModel> {
    return await this.carModel.create(data);
  };

  async editCar(carId: string, data: ICar): Promise<ICarModel> {
    const updatedCar = await this.carModel.findByIdAndUpdate(carId, data, { new: true });
    if (!updatedCar) {
      console.log("something has problem");
      throw new HttpError(400, "Can't update car data");
    }
    return updatedCar;
  };

  async findByOwner(ownerId: string): Promise<ICarModel[]> {
    return await this.carModel.find({ ownerId: ownerId, isVerified: true, verificationRejected: false }).lean().exec();
  };

  async findPaginated(page: number, limit: number): Promise<{ data: ICarModel[]; total: number; }> {
    const skip = (page - 1) * limit;
    const data = await this.carModel.find().skip(skip).limit(limit);
    const total = await this.carModel.countDocuments();
    return { data, total };
  };

}