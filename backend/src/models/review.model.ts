import { Schema, model, } from "mongoose";
import { IReviewModel } from "../types/user";

const reviewSchema = new Schema<IReviewModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    carId: { type: Schema.Types.ObjectId, ref: 'Car', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

export const Review = model<IReviewModel>("Review", reviewSchema);