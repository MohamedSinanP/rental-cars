import { Schema, model } from 'mongoose';
import { IWalletModel } from '../types/user';

const transactionSchema = new Schema(
  {
    paymentType: {
      type: String,
      required: true,
    },
    transactionAmount: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      required: false,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const walletSchema = new Schema<IWalletModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    transactions: {
      type: [transactionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Wallet = model<IWalletModel>('Wallet', walletSchema);
