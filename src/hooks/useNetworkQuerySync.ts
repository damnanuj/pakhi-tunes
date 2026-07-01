import { useLayoutEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNetwork } from "src/contexts/NetworkContext";

/**
 * Watches network state and refetches active queries when connectivity
 * transitions from offline -> online so data refreshes automatically.
 * Mount once near the app root, inside both QueryClientProvider and NetworkProvider.
 */
export function useNetworkQuerySync() {
  const { isOffline } = useNetwork();
  const queryClient = useQueryClient();
  const wasOfflineRef = useRef(isOffline);

  useLayoutEffect(() => {
    const wasOffline = wasOfflineRef.current;
    wasOfflineRef.current = isOffline;

    if (wasOffline && !isOffline) {
      void queryClient.resumePausedMutations().then(() => {
        void queryClient.refetchQueries({ type: "active" });
      });
    }
  }, [isOffline, queryClient]);
}
