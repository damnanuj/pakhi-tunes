import { useCallback } from "react";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { useAuthStore } from "src/features/auth/store/authStore";
import { useLocalHistoryStore } from "../store/localHistoryStore";
import { upsertHistory } from "../services/history.service";
import type { HistorySongPayload } from "../types/history.types";

export function recordPlayToHistory(payload: HistorySongPayload) {
  useLocalHistoryStore.getState().recordPlay(payload);

  const { token } = useAuthStore.getState();
  if (!token) return;

  void upsertHistory(payload).catch((error) => {
    console.warn("History upsert failed", error);
  });
}

export function useRecordHistory() {
  const { isAuthenticated } = useAuth();
  const recordPlayLocal = useLocalHistoryStore((state) => state.recordPlay);

  const recordPlay = useCallback(
    (payload: HistorySongPayload) => {
      recordPlayLocal(payload);

      if (isAuthenticated) {
        void upsertHistory(payload).catch((error) => {
          console.warn("History upsert failed", error);
        });
      }
    },
    [isAuthenticated, recordPlayLocal]
  );

  return { recordPlay };
}
