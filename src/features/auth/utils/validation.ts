const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SignInErrors = {
  email: string;
  password: string;
};

export type SignUpErrors = {
  name: string;
  email: string;
  password: string;
};

export function validateEmail(email: string): string {
  if (!email.trim()) return "Email is required";
  if (!EMAIL_REGEX.test(email.trim())) return "Invalid email format";
  return "";
}

export function validatePassword(password: string): string {
  if (!password) return "Password is required";
  if (password.length < 4) return "Password must be at least 4 characters";
  return "";
}

export function validateName(name: string): string {
  if (!name.trim()) return "Name is required";
  return "";
}

export function validateSignInForm(email: string, password: string): SignInErrors {
  return {
    email: validateEmail(email),
    password: validatePassword(password),
  };
}

export function validateSignUpForm(
  name: string,
  email: string,
  password: string
): SignUpErrors {
  return {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };
}

export function hasFormErrors<T extends Record<string, string>>(errors: T): boolean {
  return Object.values(errors).some((message) => message.length > 0);
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "error" in error.response.data &&
    error.response.data.error &&
    typeof error.response.data.error === "object" &&
    "message" in error.response.data.error &&
    typeof error.response.data.error.message === "string"
  ) {
    return error.response.data.error.message;
  }
  return fallback;
}

const ALLOWED_REDIRECT_PREFIXES = ["/(tabs)", "/player", "/auth", "/entry"];

export function sanitizeRedirectPath(path?: string | string[]): string {
  const value = Array.isArray(path) ? path[0] : path;
  if (!value || typeof value !== "string" || !value.startsWith("/")) {
    return "/(tabs)/home";
  }
  const isAllowed = ALLOWED_REDIRECT_PREFIXES.some((prefix) =>
    value.startsWith(prefix)
  );
  return isAllowed ? value : "/(tabs)/home";
}
