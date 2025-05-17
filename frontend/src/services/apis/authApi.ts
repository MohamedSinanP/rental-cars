import api from './api';
import { IOwnerSignup, IUserSignup, otpData } from '../../types/types';
import { store } from '../../redux/store';
import { removeAuth } from '../../redux/slices/authSlice';
import { getApiErrorMessage } from '../../utils/handleApiError';

/* -------------------------- Signup -------------------------- */

export const signupUser = async (userData: IUserSignup) => {
  try {
    const response = await api.post('/auth/signup', userData);
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const signupOwner = async (ownerData: IOwnerSignup) => {
  try {
    const response = await api.post('/auth/signup-owner', ownerData);
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/* -------------------------- login -------------------------- */
export const login = async ({ email, password }: { email: string; password: string }) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const adminLogin = async ({ email, password }: { email: string; password: string }) => {
  try {
    const response = await api.post('/auth/admin-login', { email, password });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/* -------------------------- OTP -------------------------- */
export const verifyOtp = async (otpData: otpData) => {
  try {
    const response = await api.post('/auth/verify-otp', otpData);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const resendOtp = async (email: string) => {
  try {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/* -------------------------- Email Verification -------------------------- */
export const verifyEmail = async (email: string | undefined) => {
  try {
    const response = await api.post('/auth/verify-email', { email });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/* -------------------------- Reset Password -------------------------- */
export const verifyResetOtp = async (otpData: otpData) => {
  try {
    const response = await api.post('/auth/verify-reset-otp', { otpData });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const resetPwd = async (token: string, newPwd: string) => {
  try {
    const response = await api.patch('/auth/reset-pwd', { token, newPwd });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/* -------------------------- Logout -------------------------- */
export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    store.dispatch(removeAuth());
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};
