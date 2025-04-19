import axios, { AxiosRequestConfig } from "axios";
import { store } from "../../redux/store";
import { setAccessToken, removeAuth } from "../../redux/slices/authSlice";
import { navigateTo } from "../../utils/navigateHelper";


// Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Extend AxiosRequestConfig to allow `_retry` flag
interface CustomAxiosRequest extends AxiosRequestConfig {
  _retry?: boolean;
}

// Add Authorization header to all requests
api.interceptors.request.use((config) => {
  const state = store.getState();
  const accessToken = state.auth.accessToken;

  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    token ? prom.resolve(token) : prom.reject(error);
  });
  failedQueue = [];
};

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequest;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err: any) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {},
          { withCredentials: true },
        );
        const newAccessToken = response.data.data.newAccessToken;

        store.dispatch(setAccessToken(newAccessToken));
        processQueue(null, newAccessToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        store.dispatch(removeAuth());
        navigateTo('/login');
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403: Forbidden – no permission
    if (error.response?.status === 403) {
      console.warn("Access denied (403): You do not have permission.");
    }

    return Promise.reject(error);
  }
);

export default api;
