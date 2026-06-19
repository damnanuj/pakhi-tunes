import type { ArtistSong } from "./artistSongs.types";
import type { Pagination, PaginationParams } from "./pagination.types";

export interface GenreImage {
  quality: string;
  url: string;
}

export interface Genre {
  slug: string;
  name: string;
  image: GenreImage[];
  playlistCount: number;
}

export interface GenreDetail {
  slug: string;
  name: string;
  songCount: number;
  image: GenreImage[];
  playlistCount: number;
}

export interface GenresResponse {
  data: Genre[];
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface GenreSongsData extends Pagination {
  genre: GenreDetail;
  results: ArtistSong[];
}

export interface GenreSongsResponse {
  data: GenreSongsData;
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface GenreSongsParams extends PaginationParams {}
