import mongoose, { Document, Schema } from "mongoose";
import IOwner, { OwnerResponseDTO } from "./owner";

export interface CarDTO {
  id: string;
  carName: string;
  carModel: string;
  carType: string;
  seats: string;
  transmission: string;
  fuelType: string;
  fuelOption: string;
  ownerId: string | OwnerResponseDTO,
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
  isVerified: boolean;
  verificationRejected: boolean;
  features?: string[];
  pricePerHour: number;
  deposit: number;
  lastmaintenanceDate: string;
  maintenanceInterval: number;
  isListed: boolean;
  distance?: number;
}

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
  isVerified?: boolean;
  verificationRejected?: boolean;
  rejectionReason?: string;
}

export interface ICarModel extends Document {
  _id: mongoose.Types.ObjectId
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
  distance?: number;
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