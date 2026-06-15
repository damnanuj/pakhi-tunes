import { getFavorites } from "../services/favorites.service";
import type {
  FavoriteSong,
  FavoritesResponse,
} from "../types/favorites.types";
import type { UseInfinitePaginatedQueryOptions } from "src/hooks/useInfinitePaginatedQuery";
import { getNextOffsetFromPagination } from "src/utils/pagination/getNextOffsetFromPagination";

export const FAVORITES_PAGE_SIZE = 20;
export const FAVORITES_QUERY_KEY = ["favorites"] as const;
export const FAVORITES_STATUS_QUERY_KEY = [
  ...FAVORITES_QUERY_KEY,
  "status",
] as const;
export const FAVORITES_STALE_TIME_MS = 30_000;

export function getFavoritesInfiniteQueryKey() {
  return [...FAVORITES_QUERY_KEY, FAVORITES_PAGE_SIZE];
}

export function getFavoriteStatusQueryKey(songId: string) {
  return [...FAVORITES_STATUS_QUERY_KEY, songId] as const;
}

function getItems(res: FavoritesResponse) {
  return res.data.results;
}

function getNextPageParam(
  res: FavoritesResponse,
  _allPages: FavoritesResponse[]
): number | undefined {
  return getNextOffsetFromPagination<FavoriteSong>(res, FAVORITES_PAGE_SIZE);
}

export function getFavoritesQueryOptions(): UseInfinitePaginatedQueryOptions<
  FavoriteSong,
  FavoritesResponse
> {
  return {
    queryKey: getFavoritesInfiniteQueryKey(),
    queryFn: ({ pageParam }) =>
      getFavorites({ limit: FAVORITES_PAGE_SIZE, offset: pageParam }),
    getItems,
    getNextPageParam,
    pageSize: FAVORITES_PAGE_SIZE,
    getItemKey: (favorite) => favorite.songId,
    staleTime: FAVORITES_STALE_TIME_MS,
  };
}
