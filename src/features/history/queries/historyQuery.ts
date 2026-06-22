import { getHistory } from "../services/history.service";
import type { HistoryEntry, HistoryResponse } from "../types/history.types";
import type { UseInfinitePaginatedQueryOptions } from "src/hooks/useInfinitePaginatedQuery";
import { getNextOffsetFromPagination } from "src/utils/pagination/getNextOffsetFromPagination";

export const HISTORY_PAGE_SIZE = 20;
export const HISTORY_QUERY_KEY = ["history"] as const;
export const HISTORY_STALE_TIME_MS = 30_000;

export function getHistoryInfiniteQueryKey() {
  return [...HISTORY_QUERY_KEY, HISTORY_PAGE_SIZE];
}

function getItems(res: HistoryResponse) {
  return res.data.results;
}

function getNextPageParam(
  res: HistoryResponse,
  _allPages: HistoryResponse[]
): number | undefined {
  return getNextOffsetFromPagination<HistoryEntry>(res, HISTORY_PAGE_SIZE);
}

export function getHistoryQueryOptions(): UseInfinitePaginatedQueryOptions<
  HistoryEntry,
  HistoryResponse
> {
  return {
    queryKey: getHistoryInfiniteQueryKey(),
    queryFn: ({ pageParam }) =>
      getHistory({ limit: HISTORY_PAGE_SIZE, offset: pageParam }),
    getItems,
    getNextPageParam,
    pageSize: HISTORY_PAGE_SIZE,
    getItemKey: (entry) => entry.songId,
    staleTime: HISTORY_STALE_TIME_MS,
  };
}
