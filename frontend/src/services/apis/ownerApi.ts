import api from "./api";


export const addCar = async (data: FormData) => {
  try {
    const response = await api.post('/owner/cars/add-car', data);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Signup failed");
    } else {
      throw new Error("Network error or server not responding");
    };
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
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Signup failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  }
}

export const getCars = async () => {
  try {
    const response = await api.get('/owner/get-cars');
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Signup failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  };
};