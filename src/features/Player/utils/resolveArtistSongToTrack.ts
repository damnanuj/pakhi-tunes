import { getSongById } from "src/services/songDetail.service";
import type { ArtistSong } from "src/types/artistSongs.types";
import type { ActiveTrack } from "../types";
import { mapArtistSongToTrack } from "./mapArtistSongToTrack";

export type ResolvedArtistSongTrack = {
  track: ActiveTrack;
  song: ArtistSong;
};

async function fetchSongById(id: string): Promise<ArtistSong | null> {
  try {
    return await getSongById(id);
  } catch {
    return null;
  }
}

export async function resolveArtistSongToTrack(
  song: ArtistSong
): Promise<ResolvedArtistSongTrack | null> {
  const direct = mapArtistSongToTrack(song);
  if (direct) return { track: direct, song };

  const ids = [song.id, song.encrypted_id]
    .map((id) => id?.trim())
    .filter((id): id is string => Boolean(id));

  const uniqueIds = [...new Set(ids)];
  for (const id of uniqueIds) {
    const full = await fetchSongById(id);
    if (!full) continue;

    const track = mapArtistSongToTrack(full);
    if (track) return { track, song: full };
  }

  return null;
}
