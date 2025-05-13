import { IReviewModel } from "../../types/user";

export default interface IReviewService {
  addReview(userId: string, carId: string, rating: number, comment: string): Promise<IReviewModel>;
  getAllCarReviews(carId: string): Promise<IReviewModel[]>;
}