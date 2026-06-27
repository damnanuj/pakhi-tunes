import TrackPlayer from "react-native-track-player";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import type { ActiveTrack, RepeatMode } from "src/features/Player/types";
import {
  isPositionSyncSuspended,
  suspendPositionSyncFromStatusForMs,
} from "src/features/Player/utils/playerPositionSync";
import type { HostPlaybackAnchor } from "../store/nearbySessionStore";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import {
  sessionToActiveTrack,
  type SessionTrackChangePayload,
} from "../types/session.types";

export const DRIFT_THRESHOLD_MS = 1200;
const DRIFT_CORRECTION_COOLDOWN_MS = 2000;

let lastDriftCorrectionAt = 0;

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

export function extrapolateHostPosition(anchor: HostPlaybackAnchor) {
  if (!anchor.playing) return anchor.positionMs;
  return anchor.positionMs + (Date.now() - anchor.sentAt);
}

export function adjustPositionForLatency(
  positionMs: number,
  sentAt?: number,
  playing = true
) {
  if (!sentAt || !playing) return positionMs;
  return positionMs + (Date.now() - sentAt);
}

function updateHostRepeatMode(repeatMode?: RepeatMode | string) {
  if (
    repeatMode === "off" ||
    repeatMode === "one" ||
    repeatMode === "all"
  ) {
    useNearbySessionStore.getState().setHostRepeatMode(repeatMode);
  }
}

function updateHostPlaybackAnchor(
  positionMs: number,
  playing: boolean,
  sentAt?: number
) {
  useNearbySessionStore.getState().setHostPlaybackAnchor({
    positionMs,
    sentAt: sentAt ?? Date.now(),
    playing,
  });
}

async function withRemoteSync<T>(fn: () => Promise<T>) {
  suspendPositionSyncFromStatusForMs(500);
  useNearbySessionStore.getState().setIsApplyingRemoteSync(true);
  try {
    return await fn();
  } finally {
    useNearbySessionStore.getState().setIsApplyingRemoteSync(false);
    suspendPositionSyncFromStatusForMs(350);
  }
}

function markDriftCorrected() {
  lastDriftCorrectionAt = Date.now();
}

function canCorrectDriftNow() {
  return Date.now() - lastDriftCorrectionAt >= DRIFT_CORRECTION_COOLDOWN_MS;
}

export async function applyRemoteTrackChange(
  payload: SessionTrackChangePayload & { sentAt?: number }
) {
  await withRemoteSync(async () => {
    updateHostRepeatMode(payload.repeatMode);
    updateHostPlaybackAnchor(
      payload.positionMs,
      payload.playing,
      payload.sentAt
    );

    const positionMs = payload.positionMs;

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
  });
}

export async function applyRemotePlay(
  positionMs: number,
  sentAt?: number,
  repeatMode?: RepeatMode
) {
  await withRemoteSync(async () => {
    updateHostRepeatMode(repeatMode);
    updateHostPlaybackAnchor(positionMs, true, sentAt);

    await TrackPlayer.seekTo(positionMs / 1000);
    await TrackPlayer.play();
    usePlayerStore.getState().setPlayback({
      isPlaying: true,
      positionMillis: positionMs,
    });
  });
}

export async function applyRemotePause(
  positionMs: number,
  repeatMode?: RepeatMode
) {
  await withRemoteSync(async () => {
    updateHostRepeatMode(repeatMode);
    updateHostPlaybackAnchor(positionMs, false);

    await TrackPlayer.seekTo(positionMs / 1000);
    await TrackPlayer.pause();
    usePlayerStore.getState().setPlayback({
      isPlaying: false,
      positionMillis: positionMs,
    });
  });
}

export async function applyRemoteSeek(
  positionMs: number,
  sentAt?: number,
  repeatMode?: RepeatMode
) {
  await withRemoteSync(async () => {
    const anchor = useNearbySessionStore.getState().hostPlaybackAnchor;
    const playing = anchor?.playing ?? usePlayerStore.getState().isPlaying;
    updateHostRepeatMode(repeatMode);
    updateHostPlaybackAnchor(positionMs, playing, sentAt);

    await TrackPlayer.seekTo(positionMs / 1000);
    usePlayerStore.getState().setPlayback({ positionMillis: positionMs });
  });
}

export async function applyRemoteHeartbeat(payload: {
  positionMs: number;
  playing: boolean;
  trackId?: string;
  sentAt?: number;
  repeatMode?: RepeatMode;
}) {
  const activeTrack = usePlayerStore.getState().activeTrack;
  if (payload.trackId && activeTrack?.id !== payload.trackId) {
    return;
  }

  updateHostRepeatMode(payload.repeatMode);
  updateHostPlaybackAnchor(
    payload.positionMs,
    payload.playing,
    payload.sentAt
  );

  const hostMs = adjustPositionForLatency(
    payload.positionMs,
    payload.sentAt,
    payload.playing
  );

  const progress = await TrackPlayer.getProgress();
  const localMs = Math.round(progress.position * 1000);
  const drift = Math.abs(localMs - hostMs);

  if (
    payload.playing &&
    drift > DRIFT_THRESHOLD_MS &&
    canCorrectDriftNow()
  ) {
    suspendPositionSyncFromStatusForMs(500);
    await TrackPlayer.seekTo(hostMs / 1000);
    usePlayerStore.getState().setPlayback({ positionMillis: hostMs });
    markDriftCorrected();
    suspendPositionSyncFromStatusForMs(350);
  }

  if (payload.playing && !usePlayerStore.getState().isPlaying) {
    await TrackPlayer.play();
    usePlayerStore.getState().setPlayback({ isPlaying: true });
  } else if (!payload.playing && usePlayerStore.getState().isPlaying) {
    await TrackPlayer.pause();
    usePlayerStore.getState().setPlayback({ isPlaying: false });
  }
}

export async function correctListenerDrift(localMs: number) {
  if (useNearbySessionStore.getState().role !== "listener") return;
  if (useNearbySessionStore.getState().isApplyingRemoteSync) return;
  if (isPositionSyncSuspended()) return;

  const anchor = useNearbySessionStore.getState().hostPlaybackAnchor;
  if (!anchor || !anchor.playing) return;
  if (!canCorrectDriftNow()) return;

  const hostMs = extrapolateHostPosition(anchor);
  const drift = Math.abs(localMs - hostMs);
  if (drift <= DRIFT_THRESHOLD_MS) return;

  suspendPositionSyncFromStatusForMs(500);
  try {
    await TrackPlayer.seekTo(hostMs / 1000);
    usePlayerStore.getState().setPlayback({ positionMillis: hostMs });
    markDriftCorrected();
  } catch {
    /* ignore */
  } finally {
    suspendPositionSyncFromStatusForMs(350);
  }
}
