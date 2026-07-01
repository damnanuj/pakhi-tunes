import { onlineManager, QueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { isNetworkRelatedError } from "src/utils/network/isNetworkRelatedError";
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
        if (isNetworkRelatedError(error, false)) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      networkMode: "offlineFirst",
    },
  },
});
