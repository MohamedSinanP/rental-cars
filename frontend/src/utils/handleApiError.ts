import axios, { AxiosError } from "axios";

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ message?: string }>;
    return err.response?.data?.message || "Request failed";
  }
  return "Network error or server not responding";
};
