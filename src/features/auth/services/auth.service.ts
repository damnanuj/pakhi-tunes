import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import {
  getGuestDeviceId,
  markGuestConverted,
} from "src/features/guest/store/guestStore";
import type {
  AccountAudioQuality,
  AuthResponse,
  AuthUser,
  LoginPayload,
  MeResponse,
  RegisterPayload,
} from "../types/auth.types";

function withDeviceId<T extends Record<string, unknown>>(payload: T) {
  return {
    ...payload,
    deviceId: getGuestDeviceId(),
  };
}

export async function register(payload: RegisterPayload) {
  const { data } = await apiClient.post<AuthResponse>(
    endpoints.auth.register,
    withDeviceId(payload)
  );
  markGuestConverted();
  return data.data;
}

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<AuthResponse>(
    endpoints.auth.login,
    withDeviceId(payload)
  );
  markGuestConverted();
  return data.data;
}

export async function getMe() {
  const { data } = await apiClient.get<MeResponse>(endpoints.auth.me);
  return data.data.user;
}

export interface UpdatePreferencesPayload {
  streamQuality?: AccountAudioQuality;
  downloadQuality?: AccountAudioQuality | null;
}

export async function updatePreferences(payload: UpdatePreferencesPayload) {
  const { data } = await apiClient.patch<MeResponse>(
    endpoints.users.preferences,
    payload
  );
  return data.data.user;
}
