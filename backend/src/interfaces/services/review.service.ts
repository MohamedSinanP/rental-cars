import { IReviewModel, ReviewDTO } from "../../types/user";

export default interface IReviewService {
  addReview(userId: string, carId: string, rating: number, comment: string): Promise<ReviewDTO>;
  getAllCarReviews(carId: string): Promise<ReviewDTO[]>;
}