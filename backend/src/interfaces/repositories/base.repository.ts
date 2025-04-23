import { UpdateQuery } from "mongoose";

export default interface IBaseRepository<T> {


  create(data: T): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(query?: object): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  updateByFilter(filter: object, data: UpdateQuery<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  findOne(filter: Partial<T>): Promise<T | null>;
}
