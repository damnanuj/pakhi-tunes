import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { useAuthStore } from "src/features/auth/store/authStore";
import { HISTORY_QUERY_KEY } from "../queries/historyQuery";
import { syncLocalHistoryToServer } from "../services/syncLocalHistory.service";

type HistorySyncProviderProps = {
  children: React.ReactNode;
};

export default function HistorySyncProvider({
  children,
}: HistorySyncProviderProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!isHydrated) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isAuthenticated) return;

    void syncLocalHistoryToServer()
      .then(() =>
        queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY })
      )
      .catch((error) => {
        console.warn("History sync failed", error);
      });
  }, [isAuthenticated, isHydrated, queryClient]);

  return children;
}
