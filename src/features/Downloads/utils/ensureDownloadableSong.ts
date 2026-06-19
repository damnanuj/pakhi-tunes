import { getSongById } from "src/services/songDetail.service";
import type { ArtistSong } from "src/types/artistSongs.types";

export function hasDownloadUrls(song: ArtistSong): boolean {
  return Boolean(song.downloadUrl?.some((d) => d.url));
}

export async function ensureDownloadableSong(
  song: ArtistSong
): Promise<ArtistSong> {
  if (hasDownloadUrls(song)) return song;

  const full = await getSongById(song.id);
  if (!hasDownloadUrls(full)) {
    throw new Error("This song is not available for download right now.");
  }

  return full;
}
