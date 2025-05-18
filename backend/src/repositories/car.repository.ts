import { inject, injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import { CarFilter, ICarModel } from "../types/car";
import ICarRepository from "../interfaces/repositories/car.repository";
import ICar from "../types/car";
import TYPES from "../di/types";
import { FilterQuery, Model, PipelineStage } from "mongoose";
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

  async findPaginated(page: number, limit: number, filters: CarFilter): Promise<{ data: ICarModel[]; total: number; }> {
    const skip = (page - 1) * limit;
    const query = { isListed: true, ...this.buildFilterQuery(filters) };

    const data = await this._carModel.find(query).skip(skip).limit(limit);
    const total = await this._carModel.countDocuments(query);

    return { data, total };
  }

  async findPaginatedWithDistance(userLocation: [number, number], page: number, limit: number, filters: CarFilter) {
    const skip = (page - 1) * limit;
    const filterQuery = this.buildFilterQuery(filters);

    const geoNearOptions: any = {
      near: { type: "Point", coordinates: userLocation },
      distanceField: "distance",
      spherical: true,
      query: { isVerified: true, isListed: true, ...filterQuery }
    };

    if (filters.maxDistance !== undefined) {
      geoNearOptions.maxDistance = filters.maxDistance * 1000;
    }

    if (filters.minDistance !== undefined) {
      geoNearOptions.minDistance = filters.minDistance * 1000;
    }

    const pipeline: PipelineStage[] = [
      {
        $geoNear: geoNearOptions
      },
      {
        $set: {
          distance: { $divide: ["$distance", 1000] }
        }
      }
    ];

    if (filters.search) {
      pipeline.push({
        $match: {
          $or: [
            { carName: { $regex: filters.search, $options: 'i' } },
            { description: { $regex: filters.search, $options: 'i' } }
          ]
        }
      });
    }

    pipeline.push(
      { $sort: { distance: 1 } },
      { $skip: skip },
      { $limit: limit }
    );

    const result = await this._carModel.aggregate(pipeline);

    let countPipeline: PipelineStage[] = [];
    if (filters.minDistance !== undefined || filters.maxDistance !== undefined) {
      const countGeoNearOptions: any = {
        near: { type: "Point", coordinates: userLocation },
        distanceField: "distance",
        spherical: true,
        query: { isVerified: true, isListed: true, ...filterQuery }
      };

      if (filters.maxDistance !== undefined) {
        countGeoNearOptions.maxDistance = filters.maxDistance * 1000;
      }

      if (filters.minDistance !== undefined) {
        countGeoNearOptions.minDistance = filters.minDistance * 1000;
      }

      countPipeline = [
        {
          $geoNear: countGeoNearOptions
        }
      ];

      if (filters.search) {
        countPipeline.push({
          $match: {
            $or: [
              { carName: { $regex: filters.search, $options: 'i' } },
              { description: { $regex: filters.search, $options: 'i' } }
            ]
          }
        });
      }

      countPipeline.push({ $count: 'total' });
      const countResult = await this._carModel.aggregate(countPipeline);
      const total = countResult.length > 0 ? countResult[0].total : 0;
      return { data: result, total };
    } else {
      let countQuery = { isVerified: true, isListed: true, ...filterQuery };

      if (filters.search) {
        countQuery = {
          ...countQuery,
          $or: [
            { carName: { $regex: filters.search, $options: 'i' } },
            { description: { $regex: filters.search, $options: 'i' } }
          ]
        };
      }

      const total = await this._carModel.countDocuments(countQuery);
      return { data: result, total };
    }
  }

  async getCarDocumentsById(carId: string) {
    const car = await this._carModel.findById(carId);
    if (!car) throw new HttpError(StatusCode.BAD_REQUEST, 'Car not found');

    return {
      rcUrl: car.rcDoc,
      pucUrl: car.pucDoc,
      insuranceUrl: car.insuranceDoc,
    };
  };

  buildFilterQuery(filters: CarFilter): FilterQuery<ICarModel> {
    const query: FilterQuery<ICarModel> = { isVerified: true };

    if (filters.carType?.length) {
      query.carType = { $in: filters.carType };
    }

    if (filters.transmission?.length) {
      query.transmission = { $in: filters.transmission };
    }

    if (filters.fuelType?.length) {
      query.fuelType = { $in: filters.fuelType };
    }

    if (filters.seats?.length) {
      query.seats = { $in: filters.seats };
    }

    if (filters.fuelOption?.length) {
      query.fuelOption = { $in: filters.fuelOption };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.pricePerHour = {};
      if (filters.minPrice !== undefined) {
        query.pricePerHour.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        query.pricePerHour.$lte = filters.maxPrice;
      }
    }

    return query;
  };

  async findMaxPrice(): Promise<number> {
    const result = await this._carModel.findOne()
      .sort({ pricePerHour: -1 })
      .select('pricePerHour')
      .exec();

    return result ? result.pricePerHour : 5000;
  }
};