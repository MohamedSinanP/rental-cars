import { Document, Model, PopulateOptions, UpdateQuery } from "mongoose";
import { injectable } from "inversify";
import IBaseRepository from "../interfaces/repositories/base.repository";

@injectable()
export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  };

  async create(data: Omit<T, "_id">): Promise<T> {
    return await this.model.create(data);
  };

  async findById(id: string, populate?: PopulateOptions[]): Promise<T | null> {
    let query = this.model.findById(id);
    if (populate) {
      query = query.populate(populate);
    }
    return await query.exec();
  };

  async findOne(query: object, populate?: PopulateOptions[]): Promise<T | null> {
    let findQuery = this.model.findOne(query);
    if (populate) {
      findQuery = findQuery.populate(populate);
    }
    return await findQuery.exec();
  }

  async findAll(query: object = {}, populate?: PopulateOptions[]): Promise<T[]> {
    let findQuery = this.model.find(query);
    if (populate) {
      findQuery = findQuery.populate(populate);
    }
    return await findQuery.exec();
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  };

  async updateByFilter(filter: object, data: UpdateQuery<T>): Promise<T | null> {
    return await this.model.findOneAndUpdate(filter, data, { new: true }).exec();
  };

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  };

};
