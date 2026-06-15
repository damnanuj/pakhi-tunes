import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import type {
  AuthResponse,
  LoginPayload,
  MeResponse,
  RegisterPayload,
} from "../types/auth.types";

export async function register(payload: RegisterPayload) {
  const { data } = await apiClient.post<AuthResponse>(
    endpoints.auth.register,
    payload
  );
  return data.data;
}

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<AuthResponse>(
    endpoints.auth.login,
    payload
  );
  return data.data;
}

export async function getMe() {
  const { data } = await apiClient.get<MeResponse>(endpoints.auth.me);
  return data.data.user;
}
