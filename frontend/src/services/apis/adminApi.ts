import api from "./api"



export const fetchUsers = async (page: number, limit: number) => {
  try {
    const response = await api.get('/admin/fetch-users', {
      params: {
        page,
        limit,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "OTP failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  };
};

export const fetchOwners = async () => {
  try {
    const response = await api.get('/admin/fetch-owners');
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "OTP failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  };
};

export const fetchVerificationPendingCars = async () => {
  try {
    const response = await api.get('/admin/pending-cars');
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "OTP failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  };
};
export const carVerifyApi = async (id: string) => {
  try {
    const response = await api.patch(`/admin/verify-car/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "OTP failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  };
};
export const carVerificationRejectionApi = async (id: string, rejectionReason: string) => {
  try {
    const response = await api.patch(`/admin/reject-car/${id}`, { rejectionReason });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "OTP failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  };
};