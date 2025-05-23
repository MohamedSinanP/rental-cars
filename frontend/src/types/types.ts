
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
  pricePerHour: number;
  deposit: number;
  features: string[];
  status: string;
  maintenanceDate: string;
  maintenanceInterval: number;
  rcDoc: FileList;
  pucDoc: FileList;
  insuranceDoc: FileList;
  carDoc: FileList;
  carImages: File[];
}
export interface ICar {
  id: string;
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
  pricePerHour: number;
  deposit: number;
  features: string[];
  status: string;
  lastmaintenanceDate: string;
  maintenanceInterval: number;
  rcDoc: string;
  pucDoc: string;
  insuranceDoc: string;
  isVerified: boolean;
  verificationRejected: boolean;
  rejectionReason: string;
  carImages: string[];
  review?: string[];
  isListed?: boolean;
  distance?: number;
};

export interface IBooking {
  id?: string;
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
  paymentId: string | undefined;
  status?: 'active' | 'cancelled' | 'completed';
  isPremiumBooking: boolean,
  discountPercentage: number | undefined,
  discountAmount: number | undefined,
};

export interface IBookingWithPopulatedData extends Omit<IBooking, 'userId' | 'carId'> {
  userId: User;
  carId: ICar;
  ownerId: User;
}

export interface CarDocument {
  id: string;
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
  id: string;
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
};

export interface ISubscription {
  id?: string;
  name: string;
  description: string;
  features: string[];
  stripeProductId: string;
  stripePriceId: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  isActive: boolean;
}


export interface CarFilters {
  carType?: string[];
  transmission?: string[];
  fuelType?: string[];
  seats?: string[];
  fuel?: string[];
  priceRange?: [number, number];
  distanceRange?: [number, number];
}