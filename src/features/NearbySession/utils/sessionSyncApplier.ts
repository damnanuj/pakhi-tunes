import TrackPlayer from "react-native-track-player";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import type { ActiveTrack } from "src/features/Player/types";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import {
  sessionToActiveTrack,
  type SessionTrackChangePayload,
} from "../types/session.types";

const DRIFT_THRESHOLD_MS = 800;

function activeTrackToRntpTrack(track: ActiveTrack) {
  return {
    id: track.id,
    url: track.uri,
    title: track.title,
    artist: track.artist,
    artwork: track.artworkUrl,
    duration: track.durationSec,
  };
}

function adjustPositionForLatency(positionMs: number, sentAt?: number) {
  if (!sentAt) return positionMs;
  const latency = Date.now() - sentAt;
  if (latency > 500) {
    return positionMs + latency;
  }
  return positionMs;
}

export async function applyRemoteTrackChange(
  payload: SessionTrackChangePayload & { sentAt?: number }
) {
  const store = useNearbySessionStore.getState();
  store.setIsApplyingRemoteSync(true);

  try {
    const positionMs = adjustPositionForLatency(
      payload.positionMs,
      payload.sentAt
    );
    const track = sessionToActiveTrack({
      id: payload.trackId,
      hostId: "",
      hostName: "",
      hostAvatar: null,
      trackId: payload.trackId,
      trackTitle: payload.trackTitle,
      trackArtist: payload.trackArtist,
      trackArtwork: payload.trackArtwork,
      trackUri: payload.trackUri,
      trackDuration: payload.trackDuration,
      playing: payload.playing,
      positionMs,
      listenerCount: 0,
    });

    const current = usePlayerStore.getState().activeTrack;
    if (current?.id !== track.id) {
      await TrackPlayer.reset();
      usePlayerStore.getState().setActiveTrack(track);
      await TrackPlayer.add(activeTrackToRntpTrack(track));
    }

    await TrackPlayer.seekTo(positionMs / 1000);
    if (payload.playing) {
      await TrackPlayer.play();
    } else {
      await TrackPlayer.pause();
    }

    usePlayerStore.getState().setPlayback({
      isPlaying: payload.playing,
      positionMillis: positionMs,
      durationMillis:
        payload.trackDuration > 0
          ? payload.trackDuration
          : track.durationSec * 1000,
    });
  } finally {
    useNearbySessionStore.getState().setIsApplyingRemoteSync(false);
  }
}

export async function applyRemotePlay(positionMs: number, sentAt?: number) {
  const adjusted = adjustPositionForLatency(positionMs, sentAt);
  useNearbySessionStore.getState().setIsApplyingRemoteSync(true);
  try {
    await TrackPlayer.seekTo(adjusted / 1000);
    await TrackPlayer.play();
    usePlayerStore.getState().setPlayback({
      isPlaying: true,
      positionMillis: adjusted,
    });
  } finally {
    useNearbySessionStore.getState().setIsApplyingRemoteSync(false);
  }
}

export async function applyRemotePause(positionMs: number) {
  useNearbySessionStore.getState().setIsApplyingRemoteSync(true);
  try {
    await TrackPlayer.seekTo(positionMs / 1000);
    await TrackPlayer.pause();
    usePlayerStore.getState().setPlayback({
      isPlaying: false,
      positionMillis: positionMs,
    });
  } finally {
    useNearbySessionStore.getState().setIsApplyingRemoteSync(false);
  }
}

export async function applyRemoteSeek(positionMs: number, sentAt?: number) {
  const adjusted = adjustPositionForLatency(positionMs, sentAt);
  useNearbySessionStore.getState().setIsApplyingRemoteSync(true);
  try {
    await TrackPlayer.seekTo(adjusted / 1000);
    usePlayerStore.getState().setPlayback({ positionMillis: adjusted });
  } finally {
    useNearbySessionStore.getState().setIsApplyingRemoteSync(false);
  }
}

export async function applyRemoteHeartbeat(payload: {
  positionMs: number;
  playing: boolean;
  trackId?: string;
  sentAt?: number;
}) {
  const activeTrack = usePlayerStore.getState().activeTrack;
  if (payload.trackId && activeTrack?.id !== payload.trackId) {
    return;
  }

  const progress = await TrackPlayer.getProgress();
  const localMs = Math.round(progress.position * 1000);
  const hostMs = adjustPositionForLatency(payload.positionMs, payload.sentAt);
  const drift = Math.abs(localMs - hostMs);

  if (drift > DRIFT_THRESHOLD_MS) {
    await TrackPlayer.seekTo(hostMs / 1000);
    usePlayerStore.getState().setPlayback({ positionMillis: hostMs });
  }

  if (payload.playing && !usePlayerStore.getState().isPlaying) {
    await TrackPlayer.play();
    usePlayerStore.getState().setPlayback({ isPlaying: true });
  } else if (!payload.playing && usePlayerStore.getState().isPlaying) {
    await TrackPlayer.pause();
    usePlayerStore.getState().setPlayback({ isPlaying: false });
  }
}
