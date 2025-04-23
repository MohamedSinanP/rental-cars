import { Schema, model, Document } from "mongoose";
import { IAdmin } from "../types/user";

export interface IAdminModel extends Document, Omit<IAdmin, '_id'> {
};


const adminSchema = new Schema<IAdminModel>({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "user",
  },
  refreshToken: {
    type: String,
    default: null
  }
},
  { timestamps: true }
);

export const Admin = model<IAdminModel>("Admin", adminSchema, "admin");