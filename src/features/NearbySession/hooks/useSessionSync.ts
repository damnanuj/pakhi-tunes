import { useCallback, useEffect } from "react";
import { Event, useTrackPlayerEvents } from "react-native-track-player";
import { appToast } from "src/components/toast/appToastHelpers";
import { sessionSocketService } from "../services/sessionSocket.service";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import type {
  NearbySession,
  SessionListener,
  SessionQueueTrack,
} from "../types/session.types";
import { sessionHasPlayableTrack } from "../types/session.types";
import { applyListenersUpdate } from "../utils/applyListenersUpdate";
import { connectSessionSocketReady } from "../utils/connectSessionSocketReady";
import { endListenerSession } from "../utils/endListenerSession";
import { rejoinListenerSession } from "../utils/reconcileListenerSession";
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
  const joinSession = useCallback(
    async (session: NearbySession) => {
      const socket = await connectSessionSocketReady();
      if (!socket) {
        appToast.error("Sign in required to join a session");
        return false;
      }

      const result = await sessionSocketService.joinAsListener(session.id);
      if (!result.ok) {
        appToast.error(result.error ?? "Could not join session");
        return false;
      }

      const ack = result.session;
      const liveSession: NearbySession = {
        ...session,
        positionMs:
          ack?.positionMs !== undefined
            ? Math.max(0, Number(ack.positionMs))
            : session.positionMs,
        playing:
          ack?.playing !== undefined ? Boolean(ack.playing) : session.playing,
        trackId:
          typeof ack?.trackId === "string" ? ack.trackId : session.trackId,
        trackTitle:
          typeof ack?.trackTitle === "string"
            ? ack.trackTitle
            : session.trackTitle,
        trackArtist:
          typeof ack?.trackArtist === "string"
            ? ack.trackArtist
            : session.trackArtist,
        trackArtwork:
          typeof ack?.trackArtwork === "string"
            ? ack.trackArtwork
            : session.trackArtwork,
        trackUri:
          typeof ack?.trackUri === "string" ? ack.trackUri : session.trackUri,
        trackDuration:
          ack?.trackDuration !== undefined
            ? Number(ack.trackDuration)
            : session.trackDuration,
        listenerCount:
          ack?.listenerCount !== undefined
            ? Math.max(0, Number(ack.listenerCount))
            : session.listenerCount,
        listeners: Array.isArray(ack?.listeners)
          ? (ack.listeners as SessionListener[])
          : session.listeners,
        queue: Array.isArray(ack?.queue)
          ? (ack.queue as SessionQueueTrack[])
          : session.queue ?? [],
        updatedAt:
          typeof ack?.updatedAt === "string"
            ? ack.updatedAt
            : session.updatedAt,
      };

      useNearbySessionStore.setState({
        role: "listener",
        activeSession: liveSession,
        hostName: liveSession.hostName,
        isConnected: true,
        listenerCount: liveSession.listenerCount,
        roomListeners: liveSession.listeners ?? [],
        roomQueue: liveSession.queue ?? [],
      });

      if (sessionHasPlayableTrack(liveSession)) {
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
      }

      return true;
    },
    []
  );

  const role = useNearbySessionStore((s) => s.role);

  const leaveSession = useCallback(async () => {
    await endListenerSession();
  }, []);

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
      applyListenersUpdate(payload);
    };
    const onListeners = (payload: {
      listenerCount?: number;
      listeners?: SessionListener[];
    }) => {
      applyListenersUpdate(payload);
    };
    const onConnect = () => {
      void rejoinListenerSession();
    };
    const onDisconnect = () => {
      // Keep the session so a quick reconnect can resume it; onConnect
      // re-joins the room or clears it if the room is gone.
      useNearbySessionStore.getState().setIsConnected(false);
    };
    const onEnded = () => {
      // No navigation here: this handler is mounted app-wide, so popping the
      // stack could close whatever screen the listener happens to be on. The
      // player screen leaves itself once the track clears.
      void endListenerSession().then((left) => {
        if (left) appToast.info("The host ended this session");
      });
    };

    sessionSocketService.on("connect", onConnect);
    sessionSocketService.on("disconnect", onDisconnect);
    sessionSocketService.on("session:trackChange", onTrackChange);
    sessionSocketService.on("session:play", onPlay);
    sessionSocketService.on("session:pause", onPause);
    sessionSocketService.on("session:seek", onSeek);
    sessionSocketService.on("session:heartbeat", onHeartbeat);
    sessionSocketService.on("session:listenerCount", onListenerCount);
    sessionSocketService.on("session:listeners", onListeners);
    sessionSocketService.on("session:ended", onEnded);

    return () => {
      sessionSocketService.off("connect", onConnect);
      sessionSocketService.off("disconnect", onDisconnect);
      sessionSocketService.off("session:trackChange", onTrackChange);
      sessionSocketService.off("session:play", onPlay);
      sessionSocketService.off("session:pause", onPause);
      sessionSocketService.off("session:seek", onSeek);
      sessionSocketService.off("session:heartbeat", onHeartbeat);
      sessionSocketService.off("session:listenerCount", onListenerCount);
      sessionSocketService.off("session:listeners", onListeners);
      sessionSocketService.off("session:ended", onEnded);
    };
  }, [role]);

  return { joinSession, leaveSession };
}
