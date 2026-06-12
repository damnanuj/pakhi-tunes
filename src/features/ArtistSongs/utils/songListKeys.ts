import type { ArtistSong } from "src/types/artistSongs.types";

/** Stable list key; prefer canonical song id over encrypted_id. */
export function getSongListKey(song: ArtistSong): string {
  return song.id || song.encrypted_id;
}
