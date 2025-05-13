




/////////////////// review related types for the user ////////////////////////

export interface SimilarCar {
  _id: string;
  carName: string;
  seats: string;
  pricePerDay: number;
  rating: number;
  carImages: string[];
}

export interface Review {
  _id: string;
  carId: string;
  comment: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  userId: {
    _id: string;
    userName: string;
    profilePic: string;
    email: string;
  };
}

// Define a type for valid rating keys
export type RatingKey = 1 | 2 | 3 | 4 | 5;
export type RatingCounts = Record<RatingKey, number>;