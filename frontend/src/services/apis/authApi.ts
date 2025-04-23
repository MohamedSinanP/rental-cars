import api from './api';
import { IOwnerSignup, IUserSignup, otpData } from '../../types/types';
import { useNavigate } from 'react-router-dom';
import { store } from '../../redux/store';
import { removeAuth } from '../../redux/slices/authSlice';



export const signupUser = async (userData: IUserSignup) => {
  try {
    const response = await api.post("/auth/signup", userData);
    console.log(response.data);
    return response.data.data;

  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Signup failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  };
};

export const signupOwner = async (ownerData: IOwnerSignup) => {
  try {
    const response = await api.post('/auth/signup-owner', ownerData);
    console.log(response.data);
    return response.data.data;

  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Signup failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  }
}

export const login = async ({ email, password }: { email: string, password: string }) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    console.log(response.data);

    return response.data;

  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Signup failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  };
};

export const adminLogin = async (formData: { email: string; password: string }) => {
  try {
    const response = await api.post('/auth/admin-login', formData);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "OTP failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  }
};

export const verifyOtp = async (otpData: otpData) => {
  try {
    const response = await api.post("/auth/verify-otp", otpData);
    return response.data;

  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "OTP failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  };
};

export const resendOtp = async (email: string) => {
  try {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "OTP failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  };
};

export const verifyEmail = async (email: string | undefined) => {
  try {
    const response = await api.post('/auth/verify-email', { email });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "OTP failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  };
};

export const verifyResetOtp = async (otpData: otpData) => {
  try {
    const response = await api.post('/auth/verify-reset-otp', { otpData });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "OTP failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  };
};

export const resetPwd = async (token: string, newPwd: string) => {
  try {
    const response = await api.patch('/auth/reset-pwd', { token, newPwd });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "OTP failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  }
}

export const logout = async (navigate: ReturnType<typeof useNavigate>) => {
  try {
    const response = await api.post('/auth/logout');
    await store.dispatch(removeAuth());
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "OTP failed");
    } else {
      throw new Error("Network error or server not responding");
    };
  }
}