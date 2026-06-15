import type { Pagination, PaginationParams } from "src/types/pagination.types";
import type { ActiveTrack } from "src/features/Player/types";

export interface FavoriteSong {
  id: string;
  songId: string;
  encryptedId: string;
  title: string;
  artist: string;
  artworkUrl: string;
  durationSec: number;
  uri: string;
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

export type FavoriteSongPayload = {
  songId: string;
  encryptedId?: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  durationSec?: number;
  uri?: string;
};

export type FavoritesParams = PaginationParams;

export function favoriteToActiveTrack(favorite: FavoriteSong): ActiveTrack | null {
  if (!favorite.uri) return null;
  return {
    id: favorite.songId,
    encryptedId: favorite.encryptedId || undefined,
    uri: favorite.uri,
    title: favorite.title,
    artist: favorite.artist,
    artworkUrl: favorite.artworkUrl,
    durationSec: favorite.durationSec,
  };
}

export function activeTrackToFavoritePayload(track: ActiveTrack): FavoriteSongPayload {
  return {
    songId: track.id,
    encryptedId: track.encryptedId,
    title: track.title,
    artist: track.artist,
    artworkUrl: track.artworkUrl,
    durationSec: track.durationSec,
    uri: track.uri,
  };
}
