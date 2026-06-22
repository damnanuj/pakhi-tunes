import { useCallback } from "react";
import { useAuthStore } from "src/features/auth/store/authStore";
import { queryClient } from "src/utils/query/queryClient";
import { useLocalHistoryStore } from "../store/localHistoryStore";
import { upsertHistory } from "../services/history.service";
import type { HistorySongPayload } from "../types/history.types";
import {
  payloadToHistoryEntry,
  upsertHistoryInListCache,
} from "../utils/historyCacheUpdates";
import { HISTORY_QUERY_KEY } from "../queries/historyQuery";

export function recordPlayToHistory(payload: HistorySongPayload) {
  useLocalHistoryStore.getState().recordPlay(payload);

  const entry = payloadToHistoryEntry(payload);
  const { token } = useAuthStore.getState();

  if (token) {
    upsertHistoryInListCache(queryClient, entry);
    void upsertHistory(payload)
      .then((data) => {
        if (data.entry) {
          upsertHistoryInListCache(queryClient, data.entry);
        }
      })
      .catch((error) => {
        console.warn("History upsert failed", error);
        void queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY });
      });
  }
}

export function useRecordHistory() {
  const recordPlay = useCallback((payload: HistorySongPayload) => {
    recordPlayToHistory(payload);
  }, []);

  return { recordPlay };
}
