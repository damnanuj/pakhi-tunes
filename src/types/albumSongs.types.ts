import type { Pagination, PaginationParams } from "./pagination.types";
import type {
  ArtistSong,
  ArtistSongArtist,
  ArtistSongImage,
} from "./artistSongs.types";

export interface AlbumDetail {
  id: string;
  encrypted_id: string;
  name: string;
  subtitle: string;
  description: string;
  type: string;
  year: string;
  language: string;
  explicitContent: boolean;
  playCount: number | null;
  songCount: number;
  url: string;
  copyright: string;
  image: ArtistSongImage[];
  artists: {
    primary: ArtistSongArtist[];
    featured: ArtistSongArtist[];
    all: ArtistSongArtist[];
  };
}

export interface AlbumSongsData extends Pagination {
  album: AlbumDetail;
  results: ArtistSong[];
}

export interface AlbumSongsResponse {
  data: AlbumSongsData;
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface AlbumSongsParams extends PaginationParams {}
