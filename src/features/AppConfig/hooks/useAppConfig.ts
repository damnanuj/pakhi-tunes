import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAppConfig } from "../services/appConfig.service";

export const APP_CONFIG_QUERY_KEY = ["app-config"] as const;

const APP_CONFIG_STALE_TIME_MS = 0;

export function useAppConfig() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        void queryClient.invalidateQueries({ queryKey: APP_CONFIG_QUERY_KEY });
      }
    };

    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, [queryClient]);

  return useQuery({
    queryKey: APP_CONFIG_QUERY_KEY,
    queryFn: getAppConfig,
    staleTime: APP_CONFIG_STALE_TIME_MS,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
