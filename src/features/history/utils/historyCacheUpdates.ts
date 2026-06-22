import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type {
  HistoryEntry,
  HistoryResponse,
  HistorySongPayload,
} from "../types/history.types";
import { getHistoryInfiniteQueryKey } from "../queries/historyQuery";

function createHistoryResponse(entry: HistoryEntry): HistoryResponse {
  return {
    data: {
      results: [entry],
      count: 1,
      currentPage: 1,
      totalPages: 1,
      next: null,
      previous: null,
    },
    error: {},
    isSuccess: true,
  };
}

export function payloadToHistoryEntry(payload: HistorySongPayload): HistoryEntry {
  const playedAt =
    typeof payload.playedAt === "string"
      ? payload.playedAt
      : typeof payload.playedAt === "number"
        ? new Date(payload.playedAt).toISOString()
        : new Date().toISOString();

  return {
    id: payload.songId,
    songId: payload.songId,
    encryptedId: payload.encryptedId ?? "",
    title: payload.title,
    artist: payload.artist,
    artworkUrl: payload.artworkUrl ?? "",
    albumId: payload.albumId ?? "",
    albumName: payload.albumName ?? "",
    durationSec: payload.durationSec ?? 0,
    language: payload.language ?? "",
    playedAt,
  };
}

export function mergeHistoryEntries(
  apiItems: HistoryEntry[],
  localItems: HistoryEntry[]
): HistoryEntry[] {
  const bySongId = new Map<string, HistoryEntry>();

  for (const item of apiItems) {
    bySongId.set(item.songId, item);
  }

  for (const item of localItems) {
    const existing = bySongId.get(item.songId);
    if (
      !existing ||
      new Date(item.playedAt).getTime() >= new Date(existing.playedAt).getTime()
    ) {
      bySongId.set(item.songId, item);
    }
  }

  return Array.from(bySongId.values()).sort(
    (a, b) =>
      new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
  );
}

export function upsertHistoryInListCache(
  queryClient: QueryClient,
  entry: HistoryEntry
) {
  const queryKey = getHistoryInfiniteQueryKey();
  queryClient.setQueryData<InfiniteData<HistoryResponse>>(queryKey, (old) => {
    if (!old?.pages?.length) {
      return {
        pages: [createHistoryResponse(entry)],
        pageParams: [0],
      };
    }

    let wasPresent = false;
    const pages = old.pages.map((page) => {
      const hadSong = page.data.results.some((item) => item.songId === entry.songId);
      if (hadSong) wasPresent = true;

      return {
        ...page,
        data: {
          ...page.data,
          results: page.data.results.filter((item) => item.songId !== entry.songId),
        },
      };
    });

    return {
      ...old,
      pages: pages.map((page, index) => {
        if (index !== 0) return page;

        return {
          ...page,
          data: {
            ...page.data,
            count: wasPresent ? page.data.count : page.data.count + 1,
            results: [entry, ...page.data.results],
          },
        };
      }),
    };
  });
}

export function removeHistoryFromListCache(
  queryClient: QueryClient,
  songId: string
) {
  const queryKey = getHistoryInfiniteQueryKey();
  queryClient.setQueryData<InfiniteData<HistoryResponse>>(queryKey, (old) => {
    if (!old?.pages?.length) return old;

    let wasPresent = false;
    const pages = old.pages.map((page) => {
      const hasSong = page.data.results.some((item) => item.songId === songId);
      if (hasSong) wasPresent = true;

      return {
        ...page,
        data: {
          ...page.data,
          results: page.data.results.filter((item) => item.songId !== songId),
        },
      };
    });

    if (!wasPresent) return old;

    return {
      ...old,
      pages: pages.map((page, index) =>
        index === 0
          ? {
              ...page,
              data: {
                ...page.data,
                count: Math.max(0, page.data.count - 1),
              },
            }
          : page
      ),
    };
  });
}

export function clearHistoryListCache(queryClient: QueryClient) {
  const queryKey = getHistoryInfiniteQueryKey();
  queryClient.setQueryData<InfiniteData<HistoryResponse>>(queryKey, (old) => {
    if (!old?.pages?.length) return old;

    return {
      ...old,
      pages: old.pages.map((page, index) =>
        index === 0
          ? {
              ...page,
              data: {
                ...page.data,
                count: 0,
                results: [],
              },
            }
          : {
              ...page,
              data: {
                ...page.data,
                results: [],
              },
            }
      ),
    };
  });
}

export function localEntryToHistoryEntry(
  entry: import("../types/history.types").LocalHistoryEntry
): HistoryEntry {
  return {
    id: entry.songId,
    songId: entry.songId,
    encryptedId: entry.encryptedId ?? "",
    title: entry.title,
    artist: entry.artist,
    artworkUrl: entry.artworkUrl ?? "",
    albumId: entry.albumId ?? "",
    albumName: entry.albumName ?? "",
    durationSec: entry.durationSec ?? 0,
    language: entry.language ?? "",
    playedAt: new Date(entry.playedAtMs).toISOString(),
  };
}
