import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { getFavorites } from "../services/favorites.service";
import { useLocalFavorites, useLocalFavoriteSongIds } from "./useLocalFavorites";

export const FAVORITES_QUERY_KEY = ["favorites"] as const;

export function useServerFavorites() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: () => getFavorites({ limit: 100, offset: 0 }),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useFavorites() {
  const { isAuthenticated } = useAuth();
  const serverQuery = useServerFavorites();
  const localFavorites = useLocalFavorites();

  if (isAuthenticated) {
    return serverQuery;
  }

  return {
    ...serverQuery,
    data: {
      results: localFavorites,
      count: localFavorites.length,
      currentPage: 1,
      totalPages: 1,
      next: null,
      previous: null,
    },
    isLoading: false,
    isError: false,
  };
}

export function useFavoriteSongIds() {
  const { isAuthenticated } = useAuth();
  const serverQuery = useServerFavorites();
  const localSongIds = useLocalFavoriteSongIds();

  const songIds = useMemo(() => {
    if (isAuthenticated) {
      return new Set(
        (serverQuery.data?.results ?? []).map((favorite) => favorite.songId)
      );
    }
    return localSongIds;
  }, [isAuthenticated, localSongIds, serverQuery.data?.results]);

  return {
    ...serverQuery,
    songIds,
    isFavorited: (songId?: string) => (songId ? songIds.has(songId) : false),
  };
}
