import type { ArtistSong } from "./artistSongs.types";
import type { Pagination, PaginationParams } from "./pagination.types";

export interface SongSuggestionsData extends Pagination {
  seedSongId: string;
  results: ArtistSong[];
}

export interface SongSuggestionsResponse {
  data: SongSuggestionsData;
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface SongSuggestionsParams extends PaginationParams {
  songId: string;
}

export interface SongSuggestionsPage {
  seedSongId: string;
  results: ArtistSong[];
  count: number;
  currentPage: number;
  totalPages: number;
  next: string | null;
  previous: string | null;
}
