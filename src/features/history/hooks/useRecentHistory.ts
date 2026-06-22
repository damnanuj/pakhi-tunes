import { useMemo } from "react";
import { RECENT_HISTORY_LIMIT } from "../types/history.types";
import { useLocalHistoryStore } from "../store/localHistoryStore";
import { historyToQueueStub } from "../utils/historyToQueueStub";

export function useRecentHistory() {
  const entries = useLocalHistoryStore((state) => state.entries);

  return useMemo(() => {
    const recent = Object.values(entries)
      .sort((a, b) => b.playedAtMs - a.playedAtMs)
      .slice(0, RECENT_HISTORY_LIMIT);

    return recent.map(historyToQueueStub);
  }, [entries]);
}
