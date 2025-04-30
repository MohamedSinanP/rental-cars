import { Schema, model, } from "mongoose";
import { IAddressModel } from "../types/user";

const addressSchema = new Schema<IAddressModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
  },
  { timestamps: true }
);

export const Address = model<IAddressModel>("Address", addressSchema);