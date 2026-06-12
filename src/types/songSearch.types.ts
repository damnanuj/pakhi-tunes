import type { ArtistSong } from "./artistSongs.types";
import type { Pagination, PaginationParams } from "./pagination.types";

export interface SongSearchData extends Pagination {
  results: ArtistSong[];
}

export interface SongSearchResponse {
  data: SongSearchData;
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface SongSearchParams extends PaginationParams {
  q: string;
}
