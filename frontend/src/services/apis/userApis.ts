import { IBooking } from "../../types/types";
import { getApiErrorMessage } from "../../utils/handleApiError";
import api from "./api";

// for google authentication
export const getUser = async (accessToken: string) => {
  try {
    const response = await api.get('/user/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      withCredentials: true,
    })
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const getCars = async (page: number, limit: number) => {
  try {
    const response = await api.get('/user/cars', {
      params: {
        page,
        limit
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};


export const carDetails = async (id: string | undefined) => {
  try {
    const response = await api.get(`/user/car-details/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const similarCarsApi = async (id: string | undefined) => {
  try {
    const response = await api.get(`/user/cars/similar/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const paymentIntent = async (amount: number) => {
  try {
    const response = await api.post('/payment/intent', { amount });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const carBookingApi = async (data: IBooking) => {
  try {
    const response = await api.post('/user/book-car', data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const userRentals = async (page: number, limit: number) => {
  try {
    const response = await api.get('/user/rentals', {
      params: {
        page,
        limit
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const getLatestBooking = async (bookingId: string | undefined) => {
  try {
    const response = await api.get(`/user/latest-booking/${bookingId}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const cancelBooking = async (bookingId: string | undefined) => {
  try {
    const response = await api.patch(`/user/cancel-booking/${bookingId}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};
export const fetchUserLocationAddress = async (lat: number, lng: number) => {
  try {
    const response = await api.get('/user/reverse-geocode', {
      params: {
        lat,
        lng
      }
    }
    );
    return response.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const sendUserLocation = async (userId: string, location: {
  type: "Point";
  coordinates: [number, number];
  address: string;
}) => {
  try {
    const response = await api.patch(`/user/location/${userId}`, { location: location });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};
export const getValidSubscriptions = async () => {
  try {
    const response = await api.get('/user/subscriptions');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const makeSubscription = async (priceId: string, subId: string) => {
  try {
    const response = await api.post('/user/create-subscription', { priceId, subId });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const getUserSubscription = async () => {
  try {
    const response = await api.get('/user/subscription');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const getUserAddresses = async () => {
  try {
    const response = await api.get('/user/addresses');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const getUserProfile = async () => {
  try {
    const response = await api.get('/user/details');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};
export const getUserWallet = async (page: number, limit: number) => {
  try {
    const response = await api.get('/user/wallet', {
      params: {
        page,
        limit
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const updateProfile = async (data: FormData) => {
  try {
    const response = await api.put('/user/update-profile', data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const updatePassword = async (data: FormData) => {
  try {
    const response = await api.put('/user/update-password', data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const updateProfilePic = async (data: FormData) => {
  try {
    const response = await api.patch('/user/update-profile-pic', data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const downloadInvoice = async (id: string) => {
  try {
    const response = await api.get(`/user/invoice/${id}`, {
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'application/pdf',
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};