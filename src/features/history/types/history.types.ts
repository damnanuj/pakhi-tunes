import type { Pagination, PaginationParams } from "src/types/pagination.types";
import type { ActiveTrack } from "src/features/Player/types";

export const RECENT_HISTORY_LIMIT = 10;
export const LOCAL_HISTORY_MAX = 200;
export const HISTORY_BULK_MAX = 100;

export interface HistoryEntry {
  id: string;
  songId: string;
  encryptedId: string;
  title: string;
  artist: string;
  artworkUrl: string;
  albumId: string;
  albumName: string;
  durationSec: number;
  language: string;
  playedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HistoryData extends Pagination {
  results: HistoryEntry[];
}

export interface HistoryResponse {
  data: HistoryData;
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface HistoryUpsertResponse {
  data: {
    entry: HistoryEntry;
  };
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface HistoryBulkResponse {
  data: {
    merged: number;
    skipped: number;
  };
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface HistoryRemoveResponse {
  data: {
    songId: string;
    removed: boolean;
  };
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export interface HistoryClearResponse {
  data: {
    removed: number;
  };
  error: Record<string, unknown>;
  isSuccess: boolean;
}

export type HistorySongPayload = {
  songId: string;
  encryptedId?: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  albumId?: string;
  albumName?: string;
  durationSec?: number;
  language?: string;
  playedAt?: string | number;
};

export type LocalHistoryEntry = HistorySongPayload & { playedAtMs: number };

export type HistoryParams = PaginationParams;

export function activeTrackToHistoryPayload(track: ActiveTrack): HistorySongPayload {
  return {
    songId: track.id,
    encryptedId: track.encryptedId,
    title: track.title,
    artist: track.artist,
    artworkUrl: track.artworkUrl,
    albumName: track.albumName,
    durationSec: track.durationSec,
    playedAt: new Date().toISOString(),
  };
}
