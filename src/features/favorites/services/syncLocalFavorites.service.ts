import { bulkAddFavorites } from "./favorites.service";
import { useLocalFavoritesStore } from "../store/localFavoritesStore";

export async function syncLocalFavoritesToServer(): Promise<{
  added: number;
  skipped: number;
}> {
  const songs = useLocalFavoritesStore.getState().getAll();
  if (songs.length === 0) {
    return { added: 0, skipped: 0 };
  }

  const result = await bulkAddFavorites(songs);
  useLocalFavoritesStore.getState().clearAll();
  return { added: result.added, skipped: result.skipped };
}
