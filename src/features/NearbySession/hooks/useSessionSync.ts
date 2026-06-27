import { useCallback, useEffect } from "react";
import { useRouter } from "expo-router";
import { Event, useTrackPlayerEvents } from "react-native-track-player";
import { appToast } from "src/components/toast/appToastHelpers";
import { usePlayback } from "src/features/Player/context/PlayerContext";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import { sessionSocketService } from "../services/sessionSocket.service";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import type { NearbySession } from "../types/session.types";
import { leaveListenerSessionIfActive } from "../utils/leaveListenerSession";
import {
  applyRemoteHeartbeat,
  applyRemotePause,
  applyRemotePlay,
  applyRemoteSeek,
  applyRemoteTrackChange,
  correctListenerDrift,
  extrapolateSessionPosition,
} from "../utils/sessionSyncApplier";

function patchActiveSessionMetadata(patch: Partial<NearbySession>) {
  const active = useNearbySessionStore.getState().activeSession;
  if (!active) return;
  const updated = { ...active, ...patch };
  useNearbySessionStore.getState().setActiveSession(updated);
  const sessions = useNearbySessionStore.getState().nearbySessions;
  useNearbySessionStore.getState().setNearbySessions(
    sessions.map((s) => (s.id === updated.id ? { ...s, ...patch } : s))
  );
}

export function useSessionSync() {
  const router = useRouter();
  const joinSession = useCallback(
    async (session: NearbySession) => {
      const socket = sessionSocketService.connect();
      if (!socket) {
        appToast.error("Sign in required to join a session");
        return false;
      }

      await new Promise<void>((resolve) => {
        if (socket.connected) {
          resolve();
          return;
        }
        socket.once("connect", () => resolve());
        setTimeout(resolve, 5000);
      });

      const result = await sessionSocketService.joinAsListener(session.id);
      if (!result.ok) {
        appToast.error(result.error ?? "Could not join session");
        return false;
      }

      useNearbySessionStore.getState().setRole("listener");
      useNearbySessionStore.getState().setActiveSession(session);
      useNearbySessionStore.getState().setHostName(session.hostName);
      useNearbySessionStore.getState().setIsConnected(true);

      const ack = result.session;
      if (ack?.listenerCount !== undefined) {
        useNearbySessionStore
          .getState()
          .setListenerCount(Math.max(0, Number(ack.listenerCount)));
      }
      const liveSession: NearbySession = {
        ...session,
        positionMs:
          ack?.positionMs !== undefined
            ? Math.max(0, Number(ack.positionMs))
            : session.positionMs,
        playing:
          ack?.playing !== undefined ? Boolean(ack.playing) : session.playing,
        updatedAt:
          typeof ack?.updatedAt === "string"
            ? ack.updatedAt
            : session.updatedAt,
      };
      const positionMs = extrapolateSessionPosition(liveSession);

      await applyRemoteTrackChange({
        trackId: liveSession.trackId,
        trackTitle: liveSession.trackTitle,
        trackArtist: liveSession.trackArtist,
        trackArtwork: liveSession.trackArtwork,
        trackUri: liveSession.trackUri,
        trackDuration: liveSession.trackDuration,
        positionMs,
        playing: liveSession.playing,
      });

      return true;
    },
    []
  );

  const { stopPlaybackAndClear } = usePlayback();
  const role = useNearbySessionStore((s) => s.role);

  const leaveSession = useCallback(async () => {
    if (!leaveListenerSessionIfActive()) return;

    usePlayerStore.getState().setActiveTrack(null);
    usePlayerStore.getState().resetPlayback();
    usePlayerStore.getState().setPlaybackLoading(false);

    await stopPlaybackAndClear();
  }, [stopPlaybackAndClear]);

  useTrackPlayerEvents([Event.PlaybackProgressUpdated], (event) => {
    if (event.type !== Event.PlaybackProgressUpdated) return;
    if (useNearbySessionStore.getState().role !== "listener") return;
    const localMs = Math.round(event.position * 1000);
    void correctListenerDrift(localMs);
  });

  useEffect(() => {
    if (role !== "listener") return;

    const onTrackChange = (payload: Parameters<typeof applyRemoteTrackChange>[0]) => {
      patchActiveSessionMetadata({
        trackId: payload.trackId,
        trackTitle: payload.trackTitle,
        trackArtist: payload.trackArtist,
        trackArtwork: payload.trackArtwork,
        trackUri: payload.trackUri,
        trackDuration: payload.trackDuration,
        playing: payload.playing,
        positionMs: payload.positionMs,
      });
      void applyRemoteTrackChange(payload);
    };
    const onPlay = (payload: {
      positionMs: number;
      sentAt?: number;
      repeatMode?: Parameters<typeof applyRemotePlay>[2];
    }) => {
      patchActiveSessionMetadata({
        playing: true,
        positionMs: payload.positionMs,
      });
      void applyRemotePlay(payload.positionMs, payload.sentAt, payload.repeatMode);
    };
    const onPause = (payload: {
      positionMs: number;
      repeatMode?: Parameters<typeof applyRemotePause>[1];
    }) => {
      patchActiveSessionMetadata({
        playing: false,
        positionMs: payload.positionMs,
      });
      void applyRemotePause(payload.positionMs, payload.repeatMode);
    };
    const onSeek = (payload: {
      positionMs: number;
      sentAt?: number;
      repeatMode?: Parameters<typeof applyRemoteSeek>[2];
    }) => {
      void applyRemoteSeek(payload.positionMs, payload.sentAt, payload.repeatMode);
    };
    const onHeartbeat = (payload: Parameters<typeof applyRemoteHeartbeat>[0]) => {
      void applyRemoteHeartbeat(payload);
    };
    const onListenerCount = (payload: { listenerCount: number }) => {
      const count = payload.listenerCount ?? 0;
      useNearbySessionStore.getState().setListenerCount(count);
      const active = useNearbySessionStore.getState().activeSession;
      if (active) {
        useNearbySessionStore
          .getState()
          .setActiveSession({ ...active, listenerCount: count });
      }
      const sessionId = useNearbySessionStore.getState().activeSession?.id;
      if (sessionId) {
        const sessions = useNearbySessionStore.getState().nearbySessions;
        useNearbySessionStore.getState().setNearbySessions(
          sessions.map((s) =>
            s.id === sessionId ? { ...s, listenerCount: count } : s
          )
        );
      }
    };
    const onEnded = () => {
      appToast.info("The host ended this session");
      void leaveSession();
      router.back();
    };

    sessionSocketService.on("session:trackChange", onTrackChange);
    sessionSocketService.on("session:play", onPlay);
    sessionSocketService.on("session:pause", onPause);
    sessionSocketService.on("session:seek", onSeek);
    sessionSocketService.on("session:heartbeat", onHeartbeat);
    sessionSocketService.on("session:listenerCount", onListenerCount);
    sessionSocketService.on("session:ended", onEnded);

    return () => {
      sessionSocketService.off("session:trackChange", onTrackChange);
      sessionSocketService.off("session:play", onPlay);
      sessionSocketService.off("session:pause", onPause);
      sessionSocketService.off("session:seek", onSeek);
      sessionSocketService.off("session:heartbeat", onHeartbeat);
      sessionSocketService.off("session:listenerCount", onListenerCount);
      sessionSocketService.off("session:ended", onEnded);
    };
  }, [leaveSession, role, router]);

  return { joinSession, leaveSession };
}
