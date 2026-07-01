import { useQuery } from "@tanstack/react-query";
import { getAppConfig } from "../services/appConfig.service";

export const APP_CONFIG_QUERY_KEY = ["app-config"] as const;

const APP_CONFIG_STALE_TIME_MS = 60_000;

export function useAppConfig() {
  return useQuery({
    queryKey: APP_CONFIG_QUERY_KEY,
    queryFn: getAppConfig,
    staleTime: APP_CONFIG_STALE_TIME_MS,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
