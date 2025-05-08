import { getApiErrorMessage } from "../../utils/handleApiError";
import api from "./api";


export const addCar = async (data: FormData) => {
  try {
    const response = await api.post('/owner/cars/add-car', data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};
export const updateCar = async (data: FormData) => {
  try {
    const response = await api.put('/owner/cars/update', data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const reuploadCarDocs = async (carId: string, data: FormData) => {
  try {
    const response = await api.patch(`/owner/cars/reupload-docs/${carId}`, data)
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};



export const fetchLocationAddress = async (lat: number, lng: number) => {
  try {
    const response = await api.get('/owner/reverse-geocode', {
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

export const getCars = async (page: number, limit: number) => {
  try {
    const response = await api.get('/owner/get-cars', {
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


export const fetchAllOwnerCars = async () => {
  try {
    const response = await api.get('/owner/all-cars');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const fetchAllOwnerBookings = async (page: number, limit: number) => {
  try {
    const response = await api.get('/owner/bookings', {
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

export const changeBookingStatus = async (bookingId: string, status: string) => {
  try {
    const response = await api.patch(`/owner/bookings/${bookingId}`, { status });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const getCarDocsDetails = async (carId: string, userMessage: string) => {
  try {
    const response = await api.post(`/owner/get-car-details/${carId}`, { userMessage });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const getStatsForOwner = async () => {
  try {
    const response = await api.get('/owner/get-stats');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const getRentalStatsForOwner = async (type: string, year: number, from?: string, to?: string) => {
  try {
    const response = await api.get('/owner/rental-stats', {
      params: {
        type,
        year,
        from,
        to
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

