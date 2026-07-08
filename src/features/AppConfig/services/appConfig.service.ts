import Constants from "expo-constants";
import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import type {
  AppConfigData,
  AppConfigResponse,
} from "../types/appConfig.types";

function getInstalledAppVersion(): string {
  return (
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    "0.0.0"
  );
}

export async function getAppConfig(): Promise<AppConfigData> {
  const { data } = await apiClient.get<AppConfigResponse>(endpoints.appConfig, {
    headers: {
      "X-App-Version": getInstalledAppVersion(),
    },
  });
  return data.data;
}
