import type { ArtistSong } from "./artistSongs.types";

export interface SongSuggestionsData {
  seedSongId: string;
  results: ArtistSong[];
  count: number;
}

export interface SongSuggestionsResponse {
  data: SongSuggestionsData;
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface SongSuggestionsParams {
  songId: string;
  limit?: number;
}
