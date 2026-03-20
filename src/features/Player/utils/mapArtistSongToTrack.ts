import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import { getSongCoverUrl } from "src/utils/functions/songImage";
import type { ArtistSong } from "src/types/artistSongs.types";
import type { ActiveTrack } from "../types";
import { getPreferredStreamUrl } from "./streamUrl";

export function mapArtistSongToTrack(song: ArtistSong): ActiveTrack | null {
  const uri = getPreferredStreamUrl(song.downloadUrl);
  if (!uri) return null;

  return {
    id: song.id,
    uri,
    title: decodeHtmlEntities(song.name),
    artist: song.artists.primary.map((a) => a.name).join(", "),
    artworkUrl: getSongCoverUrl(song.image),
    durationSec: song.duration,
    albumName: decodeHtmlEntities(song.album.name),
    label: song.label,
  };
}
