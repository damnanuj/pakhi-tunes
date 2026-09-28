import type { ArtistSong, ArtistSongImage } from "./artistSongs.types";
import type { Pagination, PaginationParams } from "./pagination.types";
import type { NewReleaseAlbumItem } from "./newReleases.types";

export interface SearchArtistItem {
  id: string;
  encrypted_id: string;
  name: string;
  subtitle?: string;
  image: ArtistSongImage[];
  type?: "artist";
}

export interface SearchAlbumItem extends NewReleaseAlbumItem {
  subtitle?: string;
}

export interface SearchPlaylistItem {
  id: string;
  encrypted_id: string;
  name: string;
  subtitle?: string;
  image: ArtistSongImage[];
  type: "playlist";
}

interface SearchEntityFields {
  id: string;
  encrypted_id: string;
  name: string;
  subtitle: string;
  image: ArtistSongImage[];
}

export interface SearchTopArtist extends SearchEntityFields {
  type: "artist";
}

export interface SearchTopAlbum extends SearchEntityFields {
  type: "album";
}

export interface SearchTopPlaylist extends SearchEntityFields {
  type: "playlist";
}

export interface SearchTopSong extends SearchEntityFields {
  type: "song";
  song: ArtistSong;
}

export type SearchTopItem =
  | SearchTopArtist
  | SearchTopAlbum
  | SearchTopPlaylist
  | SearchTopSong;

export interface SongSearchData extends Pagination {
  results: ArtistSong[];
  top?: SearchTopItem[];
  albums?: SearchAlbumItem[];
  artists?: SearchArtistItem[];
  playlists?: SearchPlaylistItem[];
}

export interface SongSearchResponse {
  data: SongSearchData;
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface SongSearchParams extends PaginationParams {
  q: string;
}
