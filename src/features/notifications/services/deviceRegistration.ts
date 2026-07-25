import { Platform } from "react-native";
import Constants from "expo-constants";
import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import { getGuestDeviceId } from "src/features/guest/store/guestStore";
import type { DeviceRegisterPayload } from "../types";

type RegisterResponse = {
  data: {
    device: {
      id: string;
      installationId: string;
      userId: string | null;
      status: string;
    };
    isNew: boolean;
  };
  isSuccess: boolean;
};

function resolvePlatform(): DeviceRegisterPayload["platform"] {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return "web";
}

function resolveAppVersion(): string {
  return (
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    ""
  );
}

function resolveDeviceModel(): string {
  return Constants.deviceName ?? Platform.OS;
}

/**
 * Register or refresh the FCM token with the backend.
 * Uses the persistent guest deviceId as installationId.
 */
export async function registerDeviceToken(
  fcmToken: string,
  options?: { clearUser?: boolean }
): Promise<void> {
  const installationId = getGuestDeviceId();
  const payload: DeviceRegisterPayload = {
    installationId,
    fcmToken,
    platform: resolvePlatform(),
    deviceModel: resolveDeviceModel(),
    appVersion: resolveAppVersion(),
    clearUser: options?.clearUser === true,
  };

  await apiClient.post<RegisterResponse>(endpoints.devices.register, payload);
}

/**
 * Unlink the authenticated user from this device (logout).
 * Device stays active for broadcast notifications.
 */
export async function unlinkDeviceUser(): Promise<void> {
  const installationId = getGuestDeviceId();
  try {
    await apiClient.post(endpoints.devices.unlink, { installationId });
  } catch (error) {
    console.warn("[notifications] Failed to unlink device user", error);
  }
}

/**
 * Soft-unregister this device (optional; used on opt-out).
 */
export async function unregisterDevice(): Promise<void> {
  const installationId = getGuestDeviceId();
  try {
    await apiClient.delete(endpoints.devices.item(installationId));
  } catch (error) {
    console.warn("[notifications] Failed to unregister device", error);
  }
}
