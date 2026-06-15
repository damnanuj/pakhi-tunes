import { getSongById } from "src/services/songDetail.service";
import type { ArtistSong } from "src/types/artistSongs.types";
import type { ActiveTrack } from "../types";
import { mapArtistSongToTrack } from "./mapArtistSongToTrack";

async function fetchTrackById(id: string): Promise<ActiveTrack | null> {
  try {
    const song = await getSongById(id);
    return mapArtistSongToTrack(song);
  } catch {
    return null;
  }
}

export async function resolveArtistSongToTrack(
  song: ArtistSong
): Promise<ActiveTrack | null> {
  const direct = mapArtistSongToTrack(song);
  if (direct) return direct;

  const ids = [song.id, song.encrypted_id]
    .map((id) => id?.trim())
    .filter((id): id is string => Boolean(id));

  const uniqueIds = [...new Set(ids)];
  for (const id of uniqueIds) {
    const track = await fetchTrackById(id);
    if (track) return track;
  }

  return null;
}
