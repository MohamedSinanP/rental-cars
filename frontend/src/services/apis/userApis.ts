import { CarFilters, IBooking } from "../../types/types";
import { getApiErrorMessage } from "../../utils/handleApiError";
import api from "./api";

/* =============================
 AUTHENTICATION & PROFILE
============================= */

// Fetch user profile using access token 
export const getUser = async (accessToken: string) => {
  try {
    const response = await api.get('/user/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Get full user profile details
export const getUserProfile = async () => {
  try {
    const response = await api.get('/user/details');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Update user profile info (name, email, etc.)
export const updateProfile = async (data: FormData) => {
  try {
    const response = await api.put('/user/update-profile', data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Change password
export const updatePassword = async (data: FormData) => {
  try {
    const response = await api.put('/user/update-password', data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Change profile picture
export const updateProfilePic = async (data: FormData) => {
  try {
    const response = await api.patch('/user/update-profile-pic', data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};


/* =============================
  CARS
============================= */

// Fetch all available cars with filters
export const getCars = async (
  page: number,
  limit: number,
  filters: CarFilters = {},
  searchQuery: string = ''
) => {
  try {
    const queryParams: Record<string, string | string[]> = {
      page: page.toString(),
      limit: limit.toString(),
    };

    if (searchQuery) queryParams.search = searchQuery;
    if (filters.carType?.length) queryParams.carType = filters.carType;
    if (filters.transmission?.length) queryParams.transmission = filters.transmission;
    if (filters.fuelType?.length) queryParams.fuelType = filters.fuelType;
    if (filters.seats?.length) queryParams.seats = filters.seats;
    if (filters.fuel?.length) queryParams.fuelOption = filters.fuel;
    if (filters.priceRange) {
      queryParams.minPrice = filters.priceRange[0].toString();
      queryParams.maxPrice = filters.priceRange[1].toString();
    }
    if (filters.distanceRange) {
      queryParams.minDistance = filters.distanceRange[0].toString();
      queryParams.maxDistance = filters.distanceRange[1].toString();
    }

    const response = await api.get('/user/cars', { params: queryParams });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Get car details by ID
export const carDetails = async (id: string | undefined) => {
  try {
    const response = await api.get(`/user/car-details/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Get similar cars
export const similarCarsApi = async (id: string | undefined) => {
  try {
    const response = await api.get(`/user/cars/similar/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};


/* =============================
  LOCATION
============================= */

// Convert coordinates to address
export const fetchUserLocationAddress = async (lat: number, lng: number) => {
  try {
    const response = await api.get('/user/reverse-geocode', {
      params: { lat, lng }
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Send user geolocation and address
export const sendUserLocation = async (userId: string, location: {
  type: "Point";
  coordinates: [number, number];
  address: string;
}) => {
  const response = await api.patch(`/user/location/${userId}`, { location });
  return response.data;
};


/* =============================
  PAYMENTS & SUBSCRIPTIONS
============================= */

// Create payment intent
export const paymentIntent = async (amount: number) => {
  try {
    const response = await api.post('/payment/intent', { amount });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Get all valid subscription plans
export const getValidSubscriptions = async () => {
  try {
    const response = await api.get('/user/subscriptions');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Subscribe to a plan
export const makeSubscription = async (priceId: string, subId: string) => {
  try {
    const response = await api.post('/user/create-subscription', { priceId, subId });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Get current user subscription
export const getUserSubscription = async () => {
  try {
    const response = await api.get('/user/subscription');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Cancel subscription
export const cancelSubscription = async (id: string | undefined) => {
  try {
    const response = await api.patch(`/user/subscriptions/${id}/cancel`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Get all user subscriptions with stats
export const getUserSubscriptions = async (page = 1, limit = 5) => {
  try {
    const response = await api.get(`/user/subscriptions/all-stats`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Get active subscription
export const getActiveSubscription = async () => {
  try {
    const response = await api.get('/user/subscriptions/active');
    return response.data;
  } catch (error) {
    throw error;
  }
};


/* =============================
  BOOKINGS & RENTALS
============================= */

// Book a car
export const carBookingApi = async (data: IBooking) => {
  try {
    const response = await api.post('/user/book-car', data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Get current/past rentals
export const userRentals = async (page: number, limit: number) => {
  try {
    const response = await api.get('/user/rentals', { params: { page, limit } });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Get latest booking info
export const getLatestBooking = async (bookingId: string | undefined) => {
  try {
    const response = await api.get(`/user/latest-booking/${bookingId}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Cancel booking
export const cancelBooking = async (bookingId: string | undefined) => {
  try {
    const response = await api.patch(`/user/cancel-booking/${bookingId}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Download invoice PDF
export const downloadInvoice = async (id: string) => {
  try {
    const response = await api.get(`/user/invoice/${id}`, {
      responseType: 'arraybuffer',
      headers: { 'Accept': 'application/pdf' }
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};


/* =============================
  REVIEWS
============================= */

// Add a review for a car
export const addReview = async (id: string | undefined, reviewData: {
  rating: number;
  comment: string;
}) => {
  try {
    const response = await api.post(`/user/add-review/${id}`, reviewData);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Get all reviews of a car
export const getCarAllReview = async (id: string | undefined) => {
  try {
    const response = await api.get(`/user/get-reviews/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};


/* =============================
  WISHLIST
============================= */

// Add a car to wishlist
export const addToWishlist = async (carId: string) => {
  try {
    const response = await api.post('/user/wishlist', { carId });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Remove car from wishlist
export const removeFromWishlist = async (carId: string) => {
  try {
    const response = await api.delete(`/user/wishlist/${carId}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Get wishlist
export const getWishlist = async () => {
  try {
    const response = await api.get('/user/wishlist');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Paginated wishlist
export const getUserWishlist = async (page: number, limit: number) => {
  try {
    const response = await api.get('/user/wishlist/paginated', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};


/* =============================
   WALLET & ADDRESSES
============================= */

// Get wallet transactions
export const getUserWallet = async (page: number, limit: number) => {
  try {
    const response = await api.get('/user/wallet', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// Get saved addresses
export const getUserAddresses = async () => {
  try {
    const response = await api.get('/user/addresses');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};
