
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

export interface User {
  userName: string | null;
  email: string | null;
  isVerified: boolean | null;
  role: string | null;
  isBlocked: boolean | null;
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
  carDoc: FileList;
  carImages: string[];
  review?: string[];
};

export interface IBooking {
  _id?: string;
  userId?: string | User;
  carId: string | ICar;
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
}