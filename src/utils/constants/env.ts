export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  SOCKET_URL:
    process.env.EXPO_PUBLIC_SOCKET_URL ??
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    "http://localhost:8000",
};
