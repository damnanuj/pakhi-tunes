import Constants from "expo-constants";
import { Platform } from "react-native";
import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";

export type PresencePlatform = "ios" | "android" | "web";

function getInstalledAppVersion(): string {
  return (
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    "0.0.0"
  );
}

function resolvePlatform(): PresencePlatform {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return "web";
}

export async function heartbeatPresence(deviceId: string): Promise<void> {
  await apiClient.post(endpoints.presence.heartbeat, {
    deviceId,
    platform: resolvePlatform(),
    appVersion: getInstalledAppVersion(),
  });
}

export async function endPresence(deviceId: string): Promise<void> {
  await apiClient.post(endpoints.presence.end, {
    deviceId,
    platform: resolvePlatform(),
    appVersion: getInstalledAppVersion(),
  });
}
