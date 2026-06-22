import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  LOCAL_HISTORY_MAX,
  RECENT_HISTORY_LIMIT,
  type HistorySongPayload,
  type LocalHistoryEntry,
} from "../types/history.types";

const STORAGE_KEY = "pakhi-local-history";

function parsePlayedAtMs(value?: string | number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return Date.now();
}

function trimToMax(entries: Record<string, LocalHistoryEntry>): Record<string, LocalHistoryEntry> {
  const sorted = Object.values(entries).sort((a, b) => b.playedAtMs - a.playedAtMs);
  if (sorted.length <= LOCAL_HISTORY_MAX) return entries;

  const keep = new Set(
    sorted.slice(0, LOCAL_HISTORY_MAX).map((entry) => entry.songId)
  );
  const trimmed: Record<string, LocalHistoryEntry> = {};
  for (const songId of keep) {
    trimmed[songId] = entries[songId];
  }
  return trimmed;
}

type LocalHistoryState = {
  entries: Record<string, LocalHistoryEntry>;
  recordPlay: (payload: HistorySongPayload) => void;
  remove: (songId: string) => void;
  clearAll: () => void;
  getRecent: (limit?: number) => LocalHistoryEntry[];
  getAll: () => LocalHistoryEntry[];
};

export const useLocalHistoryStore = create<LocalHistoryState>()(
  persist(
    (set, get) => ({
      entries: {},
      recordPlay: (payload) => {
        const songId = payload.songId.trim();
        if (!songId) return;

        set((state) => {
          const next: Record<string, LocalHistoryEntry> = {
            ...state.entries,
            [songId]: {
              ...payload,
              songId,
              playedAtMs: parsePlayedAtMs(payload.playedAt),
            },
          };
          return { entries: trimToMax(next) };
        });
      },
      remove: (songId) => {
        const trimmed = songId.trim();
        if (!trimmed) return;

        set((state) => {
          const { [trimmed]: _removed, ...rest } = state.entries;
          return { entries: rest };
        });
      },
      clearAll: () => set({ entries: {} }),
      getRecent: (limit = RECENT_HISTORY_LIMIT) => {
        return get()
          .getAll()
          .slice(0, limit);
      },
      getAll: () => {
        return Object.values(get().entries).sort(
          (a, b) => b.playedAtMs - a.playedAtMs
        );
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ entries: state.entries }),
    }
  )
);
