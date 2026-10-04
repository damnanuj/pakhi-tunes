import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import { getInstalledAppVersion } from "src/utils/version/getInstalledAppVersion";
import type {
  AppConfigData,
  AppConfigResponse,
} from "../types/appConfig.types";

export async function getAppConfig(): Promise<AppConfigData> {
  const { data } = await apiClient.get<AppConfigResponse>(endpoints.appConfig, {
    headers: {
      "X-App-Version": getInstalledAppVersion(),
    },
  });
  return data.data;
}
