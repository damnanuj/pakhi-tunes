import type { ActiveTrack, RepeatMode } from "src/features/Player/types";

export type SessionRole = "host" | "listener" | null;

export type NearbySession = {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar: string | null;
  trackId: string;
  trackTitle: string;
  trackArtist: string;
  trackArtwork: string;
  trackUri: string;
  trackDuration: number;
  playing: boolean;
  positionMs: number;
  listenerCount: number;
  visibility?: "nearby" | "private";
  roomCode?: string | null;
  distanceMeters?: number;
  updatedAt?: string;
};

export type ActiveSession = NearbySession;

export type UpsertSessionPayload = {
  trackId: string;
  trackTitle: string;
  trackArtist: string;
  trackArtwork: string;
  trackUri: string;
  trackDuration: number;
  playing: boolean;
  positionMs: number;
  latitude: number;
  longitude: number;
};

export type CreateRoomPayload = {
  trackId: string;
  trackTitle: string;
  trackArtist: string;
  trackArtwork: string;
  trackUri: string;
  trackDuration: number;
  playing: boolean;
  positionMs: number;
};

export type SessionTrackChangePayload = {
  trackId: string;
  trackTitle: string;
  trackArtist: string;
  trackArtwork: string;
  trackUri: string;
  trackDuration: number;
  positionMs: number;
  playing: boolean;
  repeatMode?: RepeatMode;
};

export type SessionHeartbeatPayload = {
  positionMs: number;
  playing: boolean;
  trackId?: string;
  latitude?: number;
  longitude?: number;
  repeatMode?: RepeatMode;
};

export type SessionPlaybackEventPayload = {
  positionMs: number;
  sentAt?: number;
  repeatMode?: RepeatMode;
};

export function sessionToActiveTrack(session: NearbySession): ActiveTrack {
  return {
    id: session.trackId,
    uri: session.trackUri,
    title: session.trackTitle,
    artist: session.trackArtist,
    artworkUrl: session.trackArtwork,
    durationSec: Math.max(1, Math.round((session.trackDuration || 0) / 1000)),
  };
}

export function activeTrackToSessionPayload(
  track: ActiveTrack,
  playing: boolean,
  positionMs: number,
  latitude: number,
  longitude: number
): UpsertSessionPayload {
  return {
    trackId: track.id,
    trackTitle: track.title,
    trackArtist: track.artist,
    trackArtwork: track.artworkUrl,
    trackUri: track.uri,
    trackDuration:
      track.durationSec > 0 ? track.durationSec * 1000 : positionMs,
    playing,
    positionMs,
    latitude,
    longitude,
  };
}
