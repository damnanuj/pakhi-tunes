export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  SOCKET_URL:
    process.env.EXPO_PUBLIC_SOCKET_URL ??
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    "http://localhost:8000",

  /* -- Web client ID from Firebase / Google Cloud (oauth client_type 3) -- */
  GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
};
