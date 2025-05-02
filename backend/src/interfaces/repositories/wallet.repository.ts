import { IWalletModel, TWallet } from "../../types/user";
import IBaseRepository from "./base.repository";

export default interface IWalletRepository extends IBaseRepository<IWalletModel> {
  refundToWallet(userId: string, amount: number, transactionId?: string): Promise<IWalletModel>;
};