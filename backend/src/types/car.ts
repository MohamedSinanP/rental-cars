import { Document, ObjectId, Schema } from "mongoose";

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
  pricePerDay: number;
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
  ownerId: Schema.Types.ObjectId;
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
  pricePerDay: number;
  deposit: number;
  lastmaintenanceDate: string;
  maintenanceInterval: number;
  isListed: boolean;
}