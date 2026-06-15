import { getSongById } from "src/services/songDetail.service";
import { mapArtistSongToTrack } from "src/features/Player/utils/mapArtistSongToTrack";
import type { ActiveTrack } from "src/features/Player/types";
import type { FavoriteSong } from "../types/favorites.types";

async function fetchSongTrack(id: string): Promise<ActiveTrack | null> {
  try {
    const song = await getSongById(id);
    return mapArtistSongToTrack(song);
  } catch {
    return null;
  }
}

export async function resolveFavoriteTrack(
  favorite: FavoriteSong
): Promise<ActiveTrack | null> {
  const bySongId = await fetchSongTrack(favorite.songId);
  if (bySongId) return bySongId;

  const encryptedId = favorite.encryptedId?.trim();
  if (!encryptedId || encryptedId === favorite.songId) {
    return null;
  }

  return fetchSongTrack(encryptedId);
}
