export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  discoverable?: boolean;
  role?: "user" | "admin";
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

export interface AuthResponse {
  data: AuthSession;
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface MeResponse {
  data: { user: AuthUser };
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export type AuthMode = "signin" | "signup";
