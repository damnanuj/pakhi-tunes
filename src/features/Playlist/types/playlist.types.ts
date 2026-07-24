import type { Pagination, PaginationParams } from "src/types/pagination.types";
import type { ArtistSong } from "src/types/artistSongs.types";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import { getSongCoverUrl } from "src/utils/functions/songImage";

export interface PlaylistSong {
  songId: string;
  encryptedId: string;
  title: string;
  artist: string;
  artworkUrl: string;
  addedAt?: string;
}

export type PlaylistVisibility = "private" | "public";

export interface PlaylistListItem {
  id: string;
  name: string;
  coverUrl: string;
  visibility: PlaylistVisibility;
  likesCount: number;
  songCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Playlist extends PlaylistListItem {
  songs: PlaylistSong[];
}

export interface PlaylistsData extends Pagination {
  results: PlaylistListItem[];
}

export interface PlaylistsResponse {
  data: PlaylistsData;
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface PlaylistResponse {
  data: Playlist;
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface PlaylistSongPayload {
  songId: string;
  encryptedId?: string;
  title: string;
  artist: string;
  artworkUrl?: string;
}

export interface CreatePlaylistPayload {
  name: string;
  coverUrl?: string;
}

export interface UpdatePlaylistPayload {
  name?: string;
  coverUrl?: string;
}

export interface AddSongToPlaylistsPayload extends PlaylistSongPayload {
  playlistIds: string[];
}

export interface AddSongToPlaylistsResponse {
  data: {
    added: number;
    skipped: number;
    playlists: PlaylistListItem[];
  };
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface AddSongToPlaylistResponse {
  data: {
    playlist: Playlist;
    added: boolean;
  };
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface RemoveSongFromPlaylistResponse {
  data: {
    playlist: Playlist;
    songId: string;
    removed: boolean;
  };
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface PlaylistsContainingSongResponse {
  data: {
    playlistIds: string[];
  };
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export type PlaylistsParams = PaginationParams;

export function artistSongToPlaylistPayload(
  song: ArtistSong
): PlaylistSongPayload {
  return {
    songId: song.id,
    encryptedId: song.encrypted_id,
    title: decodeHtmlEntities(song.name),
    artist: song.artists.primary.map((a) => a.name).join(", "),
    artworkUrl: getSongCoverUrl(song.image),
  };
}
