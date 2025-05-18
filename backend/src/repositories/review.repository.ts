import { inject, injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import TYPES from "../di/types";
import { Model } from "mongoose";
import { IReviewModel } from "../types/user";
import IReviewRepository from "../interfaces/repositories/reveiw.repository";


@injectable()
export default class ReviewRepository extends BaseRepository<IReviewModel> implements IReviewRepository {
  constructor(@inject(TYPES.ReviewModel) private _reviewModel: Model<IReviewModel>) {
    super(_reviewModel);
  };

  async addReview(userId: string, carId: string, rating: number, comment: string): Promise<IReviewModel> {
    return await this._reviewModel.create({ userId, carId, rating, comment });
  };
};