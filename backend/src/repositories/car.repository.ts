import { inject, injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import { ICarModel } from "../types/car";
import ICarRepository from "../interfaces/car.repository";
import ICar from "../types/car";
import TYPES from "../di/types";
import { Model } from "mongoose";


@injectable()
export class CarRepository extends BaseRepository<ICarModel> implements ICarRepository {

  constructor(@inject(TYPES.CarModel) private carModel: Model<ICarModel>) {
    super(carModel);
  };
  async addCar(data: ICar): Promise<ICarModel> {
    return await this.carModel.create(data);
  };
  async findByOwner(ownerId: string): Promise<ICarModel[]> {
    return await this.carModel.find({ ownerId: ownerId }).lean().exec();
  };

}