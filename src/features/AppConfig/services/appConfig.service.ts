import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import type {
  AppConfigData,
  AppConfigResponse,
} from "../types/appConfig.types";

export async function getAppConfig(): Promise<AppConfigData> {
  const { data } = await apiClient.get<AppConfigResponse>(endpoints.appConfig);
  return data.data;
}
