import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { HistoryEntry, HistoryResponse } from "../types/history.types";
import { getHistoryInfiniteQueryKey } from "../queries/historyQuery";

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
