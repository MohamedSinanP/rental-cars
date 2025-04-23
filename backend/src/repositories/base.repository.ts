import { Document, Model, UpdateQuery } from "mongoose";
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

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id).exec();
  };

  async findOne(query: object): Promise<T | null> {
    return await this.model.findOne(query).exec();
  };

  async findAll(query: object = {}): Promise<T[]> {
    return await this.model.find(query).exec();
  };

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
