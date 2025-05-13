import { blockOrUnblockUser } from "../../redux/slices/authSlice";
import { store } from "../../redux/store";
import { getApiErrorMessage } from "../../utils/handleApiError";
import api from "./api"



export const fetchUsers = async (page: number, limit: number, search: string) => {
  try {
    const response = await api.get('/admin/fetch-users', {
      params: {
        page,
        limit,
        search
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const fetchOwners = async (page: number, limit: number, search: string) => {
  try {
    const response = await api.get('/admin/fetch-owners', {
      params: {
        page,
        limit,
        search
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const fetchVerificationPendingCars = async () => {
  try {
    const response = await api.get('/admin/pending-cars');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};
export const carVerifyApi = async (id: string) => {
  try {
    const response = await api.patch(`/admin/verify-car/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};
export const carVerificationRejectionApi = async (id: string, rejectionReason: string) => {
  try {
    const response = await api.patch(`/admin/reject-car/${id}`, { rejectionReason });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const blockUser = async (userId: string) => {
  try {
    const response = await api.patch(`/admin/block-user/${userId}`);
    store.dispatch(blockOrUnblockUser(response.data.data.isBlocked));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
}
export const blockOwner = async (ownerId: string) => {
  try {
    const response = await api.patch(`/admin/block-owner/${ownerId}`);
    store.dispatch(blockOrUnblockUser(response.data.data.isBlocked));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const addSubscription = async (data: FormData) => {
  try {
    const response = await api.post('/admin/add-subscription', data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const fetchSubscriptions = async () => {
  try {
    const response = await api.get('/admin/get-subscriptions');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const updateSubscription = async (subId: string, data: FormData) => {
  try {
    const response = await api.put(`/admin/edit-subscription/${subId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};
export const fetchUserSubscriptions = async (page: number, limit: number, search: string) => {
  try {
    const response = await api.get('/admin/users-subscriptions', {
      params: {
        page,
        limit,
        search
      }
    });
    console.log(response.data);

    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};
export const updateSubscriptionStatus = async (subId: string, status: string) => {
  try {
    const response = await api.patch(`/admin/change-user-subscription-status/${subId}`, { status });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const getStatsForAdmin = async () => {
  try {
    const response = await api.get('/admin/get-stats');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};


export const getRentalStatsForAdmin = async (type: string, year: number, from?: string, to?: string) => {
  try {
    const response = await api.get('/admin/rental-stats', {
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
export const getRentalForAdmin = async (page: number, limit: number, type: string, year: number, from?: string, to?: string, month?: number) => {
  try {
    const response = await api.get('/admin/rentals', {
      params: {
        page,
        limit,
        type,
        year,
        from,
        to,
        month
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const getSalesReportPdf = async (type: string, year: number, from?: string, to?: string, month?: number) => {
  try {
    const response = await api.get('/admin/sales-report-pdf', {
      params: {
        type,
        year,
        from,
        to,
        month
      },
      responseType: 'arraybuffer'
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

