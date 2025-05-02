import { PopulateOptions, UpdateQuery } from "mongoose";

export default interface IBaseRepository<T> {


  create(data: T): Promise<T>;
  findById(id: string, populate?: PopulateOptions[]): Promise<T | null>;
  findAll(query?: object, populate?: PopulateOptions[]): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  updateByFilter(filter: object, data: UpdateQuery<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  findOne(filter: Partial<T>, populate?: PopulateOptions[]): Promise<T | null>;
}
