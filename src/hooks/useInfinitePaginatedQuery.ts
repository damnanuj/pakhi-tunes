import { useInfiniteQuery } from "@tanstack/react-query";

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
  getNextPageParam: (response: TResponse) => number | undefined;
  /** Page size (limit) - used for initial offset and next page calculation */
  pageSize: number;
  /** Whether the query is enabled */
  enabled?: boolean;
}

/**
 * Reusable infinite scroll hook for offset-based paginated APIs.
 * Supports any API that returns { data: { results, next, currentPage } }.
 *
 * @example Artist songs:
 *   const { items, fetchNextPage, hasNextPage, isFetchingNextPage, ... } =
 *     useInfinitePaginatedQuery({
 *       queryKey: ["artistSongs", artistId, 20],
 *       queryFn: ({ pageParam }) => getArtistSongs(artistId, { limit: 20, offset: pageParam }),
 *       getItems: (res) => res.data.results,
 *       getNextPageParam: (res) => res.data.next ? res.data.currentPage * 20 : undefined,
 *       pageSize: 20,
 *       enabled: !!artistId,
 *     });
 */
export function useInfinitePaginatedQuery<TItem, TResponse>({
  queryKey,
  queryFn,
  getItems,
  getNextPageParam,
  pageSize,
  enabled = true,
}: UseInfinitePaginatedQueryOptions<TItem, TResponse>) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn({ pageParam }),
    initialPageParam: 0,
    getNextPageParam,
    enabled,
  });

  const items = query.data?.pages.flatMap((page) => getItems(page)) ?? [];
  const firstPage = query.data?.pages[0];

  return {
    ...query,
    items,
    firstPage,
  };
}
