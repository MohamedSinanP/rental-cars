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

export const getCars = async () => {
  try {
    const response = await api.get('/user/cars');
    console.log(response.data, "hehehengahngah");

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

export const userRentals = async () => {
  try {
    const response = await api.get('/user/rentals');
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Signup failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  }
}