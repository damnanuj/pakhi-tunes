import type { ArtistSong } from "./artistSongs.types";

export interface SongDetailResponse {
  data: ArtistSong;
  error: Record<string, unknown>;
  isSuccess: boolean;
}
