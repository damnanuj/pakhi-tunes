import { useMemo } from "react";
import { useInfinitePaginatedQuery } from "src/hooks/useInfinitePaginatedQuery";
import { useAuth } from "src/features/auth/hooks/useAuth";
import {
  FAVORITES_QUERY_KEY,
  getFavoritesQueryOptions,
} from "../queries/favoritesQuery";
import { useLocalFavorites, useLocalFavoriteSongIds } from "./useLocalFavorites";

export { FAVORITES_QUERY_KEY };

export function useFavoritesList() {
  const { isAuthenticated } = useAuth();
  const infiniteQuery = useInfinitePaginatedQuery({
    ...getFavoritesQueryOptions(),
    enabled: isAuthenticated,
  });
  const localFavorites = useLocalFavorites();

  if (isAuthenticated) {
    return {
      favorites: infiniteQuery.items,
      isLoading: infiniteQuery.isLoading,
      isError: infiniteQuery.isError,
      error: infiniteQuery.error,
      isFetching: infiniteQuery.isFetching,
      fetchNextPage: infiniteQuery.fetchNextPage,
      hasNextPage: infiniteQuery.hasNextPage,
      isLoadingMore: infiniteQuery.isLoadingMore,
      refetch: infiniteQuery.refetch,
    };
  }

  return {
    favorites: localFavorites,
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false,
    fetchNextPage: async () => undefined,
    hasNextPage: false,
    isLoadingMore: false,
    refetch: async () => undefined,
  };
}

/** @deprecated Use useFavoritesList */
export function useFavorites() {
  const list = useFavoritesList();
  return {
    data: {
      results: list.favorites,
      count: list.favorites.length,
      currentPage: 1,
      totalPages: 1,
      next: null,
      previous: null,
    },
    isLoading: list.isLoading,
    isError: list.isError,
  };
}

export function useFavoriteSongIds() {
  const { isAuthenticated } = useAuth();
  const { favorites, isLoading, isError } = useFavoritesList();
  const localSongIds = useLocalFavoriteSongIds();

  const songIds = useMemo(() => {
    if (isAuthenticated) {
      return new Set(favorites.map((favorite) => favorite.songId));
    }
    return localSongIds;
  }, [favorites, isAuthenticated, localSongIds]);

  return {
    isLoading,
    isError,
    songIds,
    isFavorited: (songId?: string) => (songId ? songIds.has(songId) : false),
  };
}
