import axios from "axios";

export function isNetworkRelatedError(
  error: unknown,
  isOffline: boolean
): boolean {
  if (isOffline) return true;
  if (!error) return false;

  if (axios.isAxiosError(error)) {
    if (!error.response) return true;
    if (error.code === "ERR_NETWORK") return true;
    if (error.code === "ECONNABORTED") return true;
  }

  return false;
}
