import IBaseRepository from "./base.repository";
import { IReviewModel } from "../../types/user";

export default interface IReviewRepository extends IBaseRepository<IReviewModel> {
  addReview(userId: string, carId: string, rating: number, comment: string): Promise<IReviewModel>;
};
