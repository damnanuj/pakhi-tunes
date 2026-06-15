import { useMemo } from "react";
import { useLocalFavoritesStore } from "../store/localFavoritesStore";
import { localFavoritesToFavoriteSongs } from "../utils/localFavoriteMappers";

export function useLocalFavorites() {
  const favorites = useLocalFavoritesStore((state) => state.favorites);

  return useMemo(() => {
    const sorted = Object.values(favorites).sort((a, b) => b.savedAt - a.savedAt);
    return localFavoritesToFavoriteSongs(sorted);
  }, [favorites]);
}

export function useLocalFavoriteSongIds() {
  const favorites = useLocalFavoritesStore((state) => state.favorites);

  return useMemo(() => new Set(Object.keys(favorites)), [favorites]);
}

export function useLocalFavoriteActions() {
  const addFavorite = useLocalFavoritesStore((state) => state.addFavorite);
  const removeFavorite = useLocalFavoritesStore((state) => state.removeFavorite);
  const clearAll = useLocalFavoritesStore((state) => state.clearAll);

  return { addFavorite, removeFavorite, clearAll };
}
