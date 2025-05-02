import { blockOrUnblockUser } from "../../redux/slices/authSlice";
import { store } from "../../redux/store";
import { getApiErrorMessage } from "../../utils/handleApiError";
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
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  };
};

export const fetchOwners = async (page: number, limit: number) => {
  try {
    const response = await api.get('/admin/fetch-owners', {
      params: {
        page,
        limit
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
export const fetchUserSubscriptions = async () => {
  try {
    const response = await api.get('/admin/users-subscriptions');
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

