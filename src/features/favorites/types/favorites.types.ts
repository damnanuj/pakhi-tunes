import type { Pagination, PaginationParams } from "src/types/pagination.types";
import type { ArtistSong } from "src/types/artistSongs.types";
import type { ActiveTrack } from "src/features/Player/types";
import { decodeHtmlEntities } from "src/utils/functions/decodeHtmlEntities";
import { getSongCoverUrl } from "src/utils/functions/songImage";

export interface FavoriteSong {
  id: string;
  songId: string;
  encryptedId: string;
  title: string;
  artist: string;
  artworkUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FavoritesData extends Pagination {
  results: FavoriteSong[];
}

export interface FavoritesResponse {
  data: FavoritesData;
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface FavoriteMutationResponse {
  data: {
    favorite?: FavoriteSong;
    songId: string;
    isFavorited: boolean;
  };
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface FavoriteStatusResponse {
  data: {
    songId: string;
    isFavorited: boolean;
  };
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface FavoriteBulkResponse {
  data: {
    added: number;
    skipped: number;
    favorites: FavoriteSong[];
  };
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export type FavoriteSongPayload = {
  songId: string;
  encryptedId?: string;
  title: string;
  artist: string;
  artworkUrl?: string;
};

export type LocalFavorite = FavoriteSongPayload & { savedAt: number };

export type FavoritesParams = PaginationParams;

export function activeTrackToFavoritePayload(track: ActiveTrack): FavoriteSongPayload {
  return {
    songId: track.id,
    encryptedId: track.encryptedId,
    title: track.title,
    artist: track.artist,
    artworkUrl: track.artworkUrl,
  };
}

export function artistSongToFavoritePayload(song: ArtistSong): FavoriteSongPayload {
  return {
    songId: song.id,
    encryptedId: song.encrypted_id,
    title: decodeHtmlEntities(song.name),
    artist: song.artists.primary.map((a) => a.name).join(", "),
    artworkUrl: getSongCoverUrl(song.image),
  };
}
