import { useCallback, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  resetPaginationGuard,
  useGuardedFetchNextPage,
} from "./useGuardedFetchNextPage";

/** Paginated API response shape - must have next and currentPage */
export interface PaginatedResponse<T> {
  data: {
    results: T[];
    next: string | null;
    currentPage: number;
    totalPages?: number;
    count?: number;
    [key: string]: unknown;
  };
}

export interface UseInfinitePaginatedQueryOptions<TItem, TResponse> {
  /** React Query key for caching */
  queryKey: unknown[];
  /** Fetch function - receives offset (pageParam) */
  queryFn: (params: { pageParam: number }) => Promise<TResponse>;
  /** Extract items from response */
  getItems: (response: TResponse) => TItem[];
  /** Return next offset or undefined when no more pages */
  getNextPageParam: (
    response: TResponse,
    allPages: TResponse[]
  ) => number | undefined;
  /** Page size (limit) - used for initial offset and next page calculation */
  pageSize: number;
  /** Whether the query is enabled */
  enabled?: boolean;
  /** Dedupe key when flattening pages (keeps first occurrence). */
  getItemKey?: (item: TItem) => string;
  /** How long cached pages stay fresh before refetch (default 5 min). */
  staleTime?: number;
}

const DEFAULT_STALE_TIME_MS = 5 * 60 * 1000;

/**
 * Reusable infinite scroll hook for offset-based paginated APIs.
 * Supports any API that returns { data: { results, next, currentPage } }.
 */
export function useInfinitePaginatedQuery<TItem, TResponse>({
  queryKey,
  queryFn,
  getItems,
  getNextPageParam,
  pageSize,
  enabled = true,
  getItemKey,
  staleTime = DEFAULT_STALE_TIME_MS,
}: UseInfinitePaginatedQueryOptions<TItem, TResponse>) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn({ pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      getNextPageParam(lastPage, allPages),
    enabled,
    staleTime,
  });

  const pages = query.data?.pages;
  const pagesCount = pages?.length ?? 0;

  const items = useMemo(() => {
    const flat = pages?.flatMap((page) => getItems(page)) ?? [];
    if (!getItemKey) return flat;

    const seen = new Set<string>();
    const deduped: TItem[] = [];
    for (const item of flat) {
      const key = getItemKey(item);
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(item);
    }
    return deduped;
  }, [pages, getItems, getItemKey]);
  const firstPage = query.data?.pages[0];

  const queryKeySignature = JSON.stringify(queryKey);

  const { fetchNextPage, isLoadingMore } = useGuardedFetchNextPage(
    query.fetchNextPage,
    query.hasNextPage,
    pagesCount,
    enabled,
    query.isFetchingNextPage,
    query.isFetchNextPageError,
    queryKeySignature
  );

  const refetch = useCallback(async () => {
    resetPaginationGuard(queryKeySignature);
    return query.refetch();
  }, [query.refetch, queryKeySignature]);

  return {
    ...query,
    items,
    firstPage,
    fetchNextPage,
    isLoadingMore,
    hasNextPage: query.hasNextPage,
    refetch,
  };
}
