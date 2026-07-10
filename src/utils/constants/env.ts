export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  SOCKET_URL:
    process.env.EXPO_PUBLIC_SOCKET_URL ??
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    "http://localhost:8000",
  /** Web client ID from Firebase / Google Cloud (oauth client_type 3) */
  GOOGLE_WEB_CLIENT_ID:
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
    "485929118807-2jff8qq7r1qp9164lp5ag9uuhkpgmuq0.apps.googleusercontent.com",
};
