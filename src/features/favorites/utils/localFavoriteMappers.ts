import type { FavoriteSong, LocalFavorite } from "../types/favorites.types";

export function localFavoriteToFavoriteSong(
  local: LocalFavorite
): FavoriteSong {
  return {
    id: `local:${local.songId}`,
    songId: local.songId,
    encryptedId: local.encryptedId ?? "",
    title: local.title,
    artist: local.artist,
    artworkUrl: local.artworkUrl ?? "",
  };
}

export function localFavoritesToFavoriteSongs(
  locals: LocalFavorite[]
): FavoriteSong[] {
  return locals.map(localFavoriteToFavoriteSong);
}
