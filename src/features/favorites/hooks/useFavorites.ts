import { useQuery } from "@tanstack/react-query";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { getFavorites } from "../services/favorites.service";

export const FAVORITES_QUERY_KEY = ["favorites"] as const;

export function useFavorites() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: () => getFavorites({ limit: 100, offset: 0 }),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useFavoriteSongIds() {
  const query = useFavorites();
  const songIds = new Set(
    (query.data?.results ?? []).map((favorite) => favorite.songId)
  );

  return {
    ...query,
    songIds,
    isFavorited: (songId?: string) => (songId ? songIds.has(songId) : false),
  };
}
