import { Schema, model } from 'mongoose';
import { IWishlistModel } from '../types/user';

const wishlistSchema = new Schema<IWishlistModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cars: [
      {
        car: {
          type: Schema.Types.ObjectId,
          ref: 'Car',
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Wishlist = model<IWishlistModel>('Wishlist', wishlistSchema);
