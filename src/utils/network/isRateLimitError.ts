import axios from "axios";

export const RATE_LIMITED_STATUS = 429;

/** True when the server rejected the request with HTTP 429 (Too Many Requests). */
export function isRateLimitError(error: unknown): boolean {
  return (
    axios.isAxiosError(error) &&
    error.response?.status === RATE_LIMITED_STATUS
  );
}

/** Server message from the 429 envelope, with a generic fallback. */
export function getRateLimitMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error?.message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return "Too many requests. Please try again shortly.";
}
