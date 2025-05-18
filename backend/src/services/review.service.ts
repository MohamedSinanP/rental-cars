import { inject, injectable } from "inversify";
import IReviewService from "../interfaces/services/review.service";
import { ReviewDTO } from "../types/user";
import TYPES from "../di/types";
import IReviewRepository from "../interfaces/repositories/reveiw.repository";
import { HttpError } from "../utils/http.error";
import { StatusCode } from "../types/types";
import { Types } from "mongoose";
import { toReviewResponseDTO } from "../utils/helperFunctions";


@injectable()
export default class ReviewService implements IReviewService {
  constructor(@inject(TYPES.IReviewRepository) private _reviewRepository: IReviewRepository) { }

  async addReview(userId: string, carId: string, rating: number, comment: string): Promise<ReviewDTO> {
    const userObjId = new Types.ObjectId(userId);
    const carObjId = new Types.ObjectId(carId);
    const isReviewed = await this._reviewRepository.findOne({ userId: userObjId, carId: carObjId });
    if (isReviewed) {
      throw new HttpError(StatusCode.CONFLICT, "You have already reviewed this car.");
    }
    const newReview = await this._reviewRepository.addReview(userId, carId, rating, comment);
    if (!newReview) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't add your review ");
    }
    return toReviewResponseDTO(newReview);
  }

  async getAllCarReviews(carId: string): Promise<ReviewDTO[]> {
    const review = await this._reviewRepository.findAll({ carId }, [{ path: 'userId' }]);
    if (!review) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't get reviews of this car");
    }
    return review.map(toReviewResponseDTO);
  }
}