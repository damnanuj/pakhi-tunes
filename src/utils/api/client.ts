import axios from "axios";
import { ENV } from "src/utils/constants/env";
import {
  clearAuthSession,
  getAuthToken,
} from "src/features/auth/store/authStore";

const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url ?? "");
    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register");

    if (status === 401 && !isAuthRequest) {
      clearAuthSession();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
