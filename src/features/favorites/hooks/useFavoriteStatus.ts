import { useQuery } from "@tanstack/react-query";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { getFavoriteStatus } from "../services/favorites.service";
import {
  FAVORITES_STALE_TIME_MS,
  getFavoriteStatusQueryKey,
} from "../queries/favoritesQuery";
import { useLocalFavoriteSongIds } from "./useLocalFavorites";

export function useFavoriteStatus(songId: string | undefined) {
  const { isAuthenticated } = useAuth();
  const localSongIds = useLocalFavoriteSongIds();

  const query = useQuery({
    queryKey: getFavoriteStatusQueryKey(songId ?? ""),
    queryFn: () => getFavoriteStatus(songId!),
    enabled: isAuthenticated && Boolean(songId),
    staleTime: FAVORITES_STALE_TIME_MS,
  });

  if (!songId) {
    return { isFavorited: false, isLoading: false, isError: false };
  }

  if (!isAuthenticated) {
    return {
      isFavorited: localSongIds.has(songId),
      isLoading: false,
      isError: false,
    };
  }

  return {
    isFavorited: query.data?.isFavorited ?? false,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
