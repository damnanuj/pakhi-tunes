import { onlineManager, QueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { isNetworkRelatedError } from "src/utils/network/isNetworkRelatedError";
import { isRateLimitError } from "src/utils/network/isRateLimitError";
import { deriveOnline } from "src/utils/network/deriveOffline";

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(deriveOnline(state));
  });
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: "offlineFirst",
      retry: (failureCount, error) => {
        // Retrying a 429 only spends more of the same rate-limit window.
        if (isRateLimitError(error)) return false;
        if (isNetworkRelatedError(error, false)) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      networkMode: "offlineFirst",
    },
  },
});
