import { inject, injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import TYPES from "../di/types";
import { Model } from "mongoose";
import { IUserSubscription, IUserSubscriptionModel, IWalletModel, TTransaction, TWallet } from "../types/user";
import IWalletRepository from "../interfaces/repositories/wallet.repository";


@injectable()
export default class WalletRepository extends BaseRepository<IWalletModel> implements IWalletRepository {
  constructor(@inject(TYPES.WalletModel) private _walletModel: Model<IWalletModel>) {
    super(_walletModel);
  };
  async refundToWallet(userId: string, amount: number, transactionId?: string): Promise<IWalletModel> {
    let wallet = await this._walletModel.findOne({ userId });

    const transaction: TTransaction = {
      paymentType: 'credit',
      transactionAmount: amount,
      date: new Date(),
    };
    if (transactionId) {
      transaction.transactionId
    };

    if (!wallet) {
      wallet = await this._walletModel.create({
        userId,
        balance: amount,
        transactions: [transaction],
      });
    } else {
      wallet.balance += amount;
      wallet.transactions.push(transaction);
      await wallet.save();
    }

    return wallet;
  };

};