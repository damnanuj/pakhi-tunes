import type { ActiveTrack, RepeatMode } from "src/features/Player/types";
import type { ArtistSong, ArtistSongArtist } from "src/types/artistSongs.types";

export type SessionRole = "host" | "listener" | null;

export type SessionListener = {
  userId: string;
  name: string;
  avatar: string | null;
};

export type SessionQueueAddedBy = {
  userId: string;
  name: string;
  avatar: string | null;
};

export type SessionQueueTrack = {
  queueItemId: string;
  songId: string;
  encryptedId: string;
  title: string;
  artist: string;
  artworkUrl: string;
  durationSec: number;
  albumName: string;
  downloadUrl: { quality: string; url: string }[];
  addedBy: SessionQueueAddedBy;
  addedAt: string;
};

export type SessionQueueAddPayload = {
  songId: string;
  encryptedId?: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  durationSec?: number;
  albumName?: string;
  downloadUrl?: { quality: string; url: string }[];
};

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
  listeners?: SessionListener[];
  queue?: SessionQueueTrack[];
  visibility?: "nearby" | "private";
  roomCode?: string | null;
  hostConnected?: boolean;
  hostLastSeenAt?: string | null;
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
  trackId?: string;
  trackTitle?: string;
  trackArtist?: string;
  trackArtwork?: string;
  trackUri?: string;
  trackDuration?: number;
  playing?: boolean;
  positionMs?: number;
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

export function sessionHasPlayableTrack(session: {
  trackId?: string | null;
  trackUri?: string | null;
}) {
  return Boolean(session.trackId?.trim() && session.trackUri?.trim());
}

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

function stubArtist(name: string): ArtistSongArtist {
  return {
    id: "",
    name,
    role: "artist",
    image: [],
    type: "artist",
    url: "",
  };
}

export function artistSongToSessionQueuePayload(
  song: ArtistSong
): SessionQueueAddPayload {
  return {
    songId: song.id,
    encryptedId: song.encrypted_id ?? "",
    title: song.name,
    artist: song.artists.primary.map((a) => a.name).join(", "),
    artworkUrl: song.image?.[0]?.url ?? "",
    durationSec: Math.max(0, Number(song.duration) || 0),
    albumName: song.album?.name ?? "",
    downloadUrl: Array.isArray(song.downloadUrl)
      ? song.downloadUrl.map((entry) => ({
          quality: entry.quality,
          url: entry.url,
        }))
      : [],
  };
}

export function sessionQueueTrackToArtistSong(
  item: SessionQueueTrack
): ArtistSong {
  const artist = stubArtist(item.artist);
  return {
    id: item.songId,
    encrypted_id: item.encryptedId || "",
    name: item.title,
    type: "song",
    year: "",
    releaseDate: "",
    duration: item.durationSec || 0,
    label: "",
    explicitContent: false,
    playCount: 0,
    language: "",
    hasLyrics: false,
    lyricsId: null,
    lyrics: null,
    url: "",
    copyright: "",
    album: { id: "", name: item.albumName || "", url: "" },
    artists: {
      primary: [artist],
      featured: [],
      all: [artist],
    },
    image: item.artworkUrl
      ? [{ quality: "150x150", url: item.artworkUrl }]
      : [],
    downloadUrl: item.downloadUrl ?? [],
  };
}
