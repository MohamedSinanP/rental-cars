import { Document, Schema } from "mongoose";
import IOwner from "./owner";

export default interface ICar {
  _id?: string;
  carName: string;
  carModel: string;
  carType: string;
  seats: string;
  transmission: string;
  fuelType: string;
  fuelOption: string;
  ownerId: string,
  carImages: string[];
  rcDoc: string;
  pucDoc: string;
  insuranceDoc: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  status: "Available" | "Booked" | "Unavailable" | "UnderMaintenance" | "PendingApproval" | "Archived";
  features?: string[];
  pricePerHour: number;
  deposit: number;
  lastmaintenanceDate: string;
  maintenanceInterval: number;
  isListed: boolean;
}

export interface ICarModel extends Document {
  carName: string;
  carModel: string;
  carType: string;
  seats: string;
  transmission: string;
  fuelType: string;
  fuelOption: string;
  ownerId: Schema.Types.ObjectId | IOwner;
  carImages: string[];
  rcDoc: string;
  pucDoc: string;
  insuranceDoc: string;
  isVerified: boolean;
  verificationRejected: boolean;
  rejectionReason: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  status: "Available" | "Booked" | "Unavailable" | "UnderMaintenance" | "PendingApproval" | "Archived";
  features?: string[];
  pricePerHour: number;
  deposit: number;
  lastmaintenanceDate: string;
  maintenanceInterval: number;
  isListed: boolean;
}

export interface CarFilter {
  carType: string[];
  transmission: string[];
  fuelType: string[];
  seats: string[];
  fuelOption: string[];
  minPrice: number;
  maxPrice: number;
  search: string;
  minDistance?: number;
  maxDistance?: number;
}