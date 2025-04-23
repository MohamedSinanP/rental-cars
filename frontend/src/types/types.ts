
export interface IUserSignup {
  userName: string;
  email: string;
  password: string;
  role: string;
}
export interface IOwnerSignup {
  userName: string;
  email: string;
  password: string;
  role: string;
  commision: number;
}

export interface TableData {
  userName: string;
  email: string;
  role: string;
  isBlocked: boolean;
  commision?: number;
}

export interface User {
  userName?: string | null;
  email: string | null;
  isVerified?: boolean | null;
  role: string | null;
  isBlocked?: boolean | null;
}

export interface Auth {
  user: User;
  accessToken?: string | null;
}


export interface otpData {
  email: string;
  otp: string | undefined;
}


export interface CarFormData {
  name: string;
  model: string;
  type: string;
  seats: string;
  transmission: string;
  fuelType: string;
  fuelOption: string;
  location: {
    type: string;
    coordinates: number[];
    address: string;
  };
  pricePerDay: number;
  deposit: number;
  features: string[];
  availability: string;
  maintenanceDate: string;
  maintenanceInterval: number;
  rcDoc: FileList;
  pucDoc: FileList;
  insuranceDoc: FileList;
  carDoc: FileList;
  carImages: File[];
}
export interface ICar {
  _id: string;
  ownerId: string;
  carName: string;
  carModel: string;
  carType: string;
  seats: string;
  transmission: string;
  fuelType: string;
  fuelOption: string;
  location: {
    type: string;
    coordinates: number[];
    address: string;
  };
  pricePerDay: number;
  deposit: number;
  features: string[];
  availability: string;
  lastmaintenanceDate: string;
  maintenanceInterval: number;
  rcDoc: FileList;
  pucDoc: FileList;
  insuranceDoc: FileList;
  isVerified: boolean;
  verificationRejected: boolean;
  rejectionReason: string;
  carImages: string[];
  review?: string[];
};

export interface IBooking {
  _id?: string;
  userId?: string | User;
  carId: string | ICar;
  ownerId: string | User;
  userDetails: {
    address: string;
    email: string;
    name: string;
    phoneNumber: string;
  };
  carLocation?: {
    address?: string;
    latitude?: number;
    longitude?: string;
  };
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: Date;
  dropoffDateTime: Date;
  totalPrice: number;
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'wallet' | 'stripe';
  paymentId: string;
  status?: 'active' | 'cancelled' | 'completed';
};

export interface IBookingWithPopulatedData extends Omit<IBooking, 'userId' | 'carId'> {
  userId: User;
  carId: ICar;
  ownerId: User;
}

export interface CarDocument {
  _id: string;
  carName: string;
  carModel: string;
  registrationNumber: string;
  rcDoc: string;
  pucDoc: string;
  insuranceDoc: string;
  ownerId: {
    name: string;
    email: string;
  };
  isVerified: boolean;
  verificationRejected?: boolean;
  rejectionReason?: string;
};

export type IUsers = {
  _id: string;
  userName: string;
  email: string;
  role: string;
  isBlocked: boolean;
  commission?: number;
};


export interface Owner {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  commission: string;
};


export interface UserInput {
  userName: "",
  email: "",
  password: "",
  confirmPassword: "",
}
