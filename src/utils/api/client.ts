import axios from "axios";
import { ENV } from "src/utils/constants/env";
import {
  clearAuthSession,
  getAuthToken,
} from "src/features/auth/store/authStore";
import { appToast } from "src/components/toast/appToastHelpers";
import {
  getRateLimitMessage,
  isRateLimitError,
} from "src/utils/network/isRateLimitError";

const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Background calls that fire on a timer or on playback events. A 429 here must
 * never show a toast over the player; the next normal call will recover.
 */
const SILENT_RATE_LIMIT_PATHS = [
  "/presence/",
  "/listening/report",
  "/guests/ping",
  "/sessions/nearby",
];

const RATE_LIMIT_TOAST_COOLDOWN_MS = 4_000;
let lastRateLimitToastAt = 0;

function isSilentRateLimitUrl(url: string) {
  return SILENT_RATE_LIMIT_PATHS.some((path) => url.includes(path));
}

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

    if (isRateLimitError(error) && !isSilentRateLimitUrl(requestUrl)) {
      const now = Date.now();
      if (now - lastRateLimitToastAt >= RATE_LIMIT_TOAST_COOLDOWN_MS) {
        lastRateLimitToastAt = now;
        appToast.error(getRateLimitMessage(error));
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
