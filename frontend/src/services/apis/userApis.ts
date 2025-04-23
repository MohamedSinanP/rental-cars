import { IBooking } from "../../types/types";
import api from "./api";

// for google authentication
export const getUser = async (accessToken: string) => {
  const response = await api.get('/user/profile', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    withCredentials: true,
  })
  return response.data;

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
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Signup failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  };
};


export const carDetails = async (id: string | undefined) => {
  try {
    const response = await api.get(`/user/car-details/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Signup failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  };
};

export const similarCarsApi = async (id: string | undefined) => {
  try {
    const response = await api.get(`/user/cars/similar/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Signup failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  };
};

export const paymentIntent = async (amount: number) => {
  try {
    const response = await api.post('/payment/intent', { amount });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Signup failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  };
};

export const carBookingApi = async (data: IBooking) => {
  try {
    const response = await api.post('/user/book-car', data);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Signup failed");
    } else {
      throw new Error("Network error or server not responding");
    };
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
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Signup failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  };
};

export const getLatestBooking = async (bookingId: string | undefined) => {
  try {
    const response = await api.get(`/user/latest-booking/${bookingId}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Signup failed");
    } else {
      throw new Error("Network error or server not responding");
    };
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
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Signup failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  };
};

export const sendUserLocation = async (location: {
  type: "Point";
  coordinates: [number, number];
  address: string;
}) => {
  try {
    const response = await api.patch('/user/location', { location: location });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Signup failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  }
}