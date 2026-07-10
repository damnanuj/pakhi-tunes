import Constants from "expo-constants";
import { Platform } from "react-native";
import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import type {
  GuestPingApiResponse,
  GuestPingPayload,
  GuestPingResponse,
  GuestPlatform,
} from "../types/guest.types";

function getInstalledAppVersion(): string {
  return (
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    "0.0.0"
  );
}

function resolvePlatform(): GuestPlatform {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return "web";
}

export async function pingGuest(deviceId: string): Promise<GuestPingResponse> {
  const payload: GuestPingPayload = {
    deviceId,
    platform: resolvePlatform(),
    appVersion: getInstalledAppVersion(),
    slug: "pakhi-tunes",
  };

  const { data } = await apiClient.post<GuestPingApiResponse>(
    endpoints.guests.ping,
    payload
  );

  return data.data;
}
