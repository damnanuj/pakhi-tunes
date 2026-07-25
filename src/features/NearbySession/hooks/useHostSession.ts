import { useCallback, useEffect, useRef } from "react";
import TrackPlayer from "react-native-track-player";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import {
  patchSessionPosition,
  stopHostSession,
  upsertHostSession,
} from "../services/session.service";
import { sessionSocketService } from "../services/sessionSocket.service";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import { activeTrackToSessionPayload } from "../types/session.types";
import { setSessionHostBridge } from "../utils/sessionHostBridge";
import { getCurrentCoordinates } from "../utils/locationPermission";

const HEARTBEAT_INTERVAL_MS = 3_000;

function patchActiveSessionPlayback(patch: {
  playing?: boolean;
  positionMs?: number;
  trackId?: string;
  trackTitle?: string;
  trackArtist?: string;
  trackArtwork?: string;
  trackUri?: string;
  trackDuration?: number;
}) {
  const active = useNearbySessionStore.getState().activeSession;
  if (!active) return;
  useNearbySessionStore.getState().setActiveSession({ ...active, ...patch });
}

export function useHostSession() {
  const { isAuthenticated, user } = useAuth();
  const activeTrack = usePlayerStore((s) => s.activeTrack);
  const role = useNearbySessionStore((s) => s.role);
  const roomCode = useNearbySessionStore((s) => s.roomCode);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onConnectRef = useRef<(() => void) | null>(null);
  const onListenerCountRef = useRef<
    ((event: { listenerCount: number }) => void) | null
  >(null);

  const stopHosting = useCallback(async () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    const sessionId = useNearbySessionStore.getState().activeSession?.id;
    if (sessionId) {
      sessionSocketService.emitHostStop();
      try {
        await stopHostSession(sessionId);
      } catch {
        /* ignore */
      }
    }
    useNearbySessionStore.getState().resetSession();
  }, []);

  const ensureHostSession = useCallback(async () => {
    if (!isAuthenticated || !user?.discoverable || !activeTrack) return;
    if (useNearbySessionStore.getState().role === "listener") return;
    // Private rooms take priority — do not auto-convert to nearby
    if (useNearbySessionStore.getState().roomCode) return;

    const coords = await getCurrentCoordinates();
    if (!coords) return;

    const player = usePlayerStore.getState();
    const payload = activeTrackToSessionPayload(
      activeTrack,
      player.isPlaying,
      player.positionMillis,
      coords.latitude,
      coords.longitude
    );

    try {
      const session = await upsertHostSession(payload);
      useNearbySessionStore.setState({
        activeSession: session,
        role: "host",
        listenerCount: session.listenerCount,
        roomCode: null,
      });

      const socket = sessionSocketService.connect();
      if (!socket) return;

      if (onConnectRef.current) {
        socket.off("connect", onConnectRef.current);
      }
      if (onListenerCountRef.current) {
        socket.off("session:listenerCount", onListenerCountRef.current);
      }

      const onConnect = () => {
        useNearbySessionStore.getState().setIsConnected(true);
        void sessionSocketService.emitHostStart(session.id);
      };
      const onListenerCount = (event: { listenerCount: number }) => {
        useNearbySessionStore
          .getState()
          .setListenerCount(event.listenerCount ?? 0);
      };

      onConnectRef.current = onConnect;
      onListenerCountRef.current = onListenerCount;
      socket.on("connect", onConnect);
      socket.on("session:listenerCount", onListenerCount);

      if (socket.connected) {
        useNearbySessionStore.getState().setIsConnected(true);
        await sessionSocketService.emitHostStart(session.id);
      }
    } catch {
      /* ignore hosting errors */
    }
  }, [activeTrack, isAuthenticated, user?.discoverable]);

  useEffect(() => {
    // Private room hosts are managed by usePrivateRoomHost
    if (roomCode) return;

    if (!isAuthenticated || !user?.discoverable || !activeTrack) {
      if (role === "host" && !useNearbySessionStore.getState().roomCode) {
        void stopHosting();
      }
      return;
    }

    void ensureHostSession();
  }, [
    activeTrack?.id,
    ensureHostSession,
    isAuthenticated,
    role,
    roomCode,
    stopHosting,
    user?.discoverable,
  ]);

  useEffect(() => {
    setSessionHostBridge({
      onPlay: (positionMs, repeatMode) => {
        if (useNearbySessionStore.getState().role !== "host") return;
        patchActiveSessionPlayback({ playing: true, positionMs });
        sessionSocketService.emitHostPlay(positionMs, repeatMode);
      },
      onPause: (positionMs, repeatMode) => {
        if (useNearbySessionStore.getState().role !== "host") return;
        patchActiveSessionPlayback({ playing: false, positionMs });
        sessionSocketService.emitHostPause(positionMs, repeatMode);
      },
      onSeek: (positionMs, repeatMode) => {
        if (useNearbySessionStore.getState().role !== "host") return;
        patchActiveSessionPlayback({ positionMs });
        sessionSocketService.emitHostSeek(positionMs, repeatMode);
      },
      onTrackChange: (payload) => {
        if (useNearbySessionStore.getState().role !== "host") return;
        patchActiveSessionPlayback({
          trackId: payload.trackId,
          trackTitle: payload.trackTitle,
          trackArtist: payload.trackArtist,
          trackArtwork: payload.trackArtwork,
          trackUri: payload.trackUri,
          trackDuration: payload.trackDuration,
          positionMs: payload.positionMs,
          playing: payload.playing,
        });
        sessionSocketService.emitHostTrackChange(payload);
      },
      onHeartbeat: async (payload) => {
        if (useNearbySessionStore.getState().role !== "host") return;
        patchActiveSessionPlayback({
          playing: payload.playing,
          positionMs: payload.positionMs,
          ...(payload.trackId ? { trackId: payload.trackId } : {}),
        });
        sessionSocketService.emitHostHeartbeat(payload);
        const sessionId = useNearbySessionStore.getState().activeSession?.id;
        if (!sessionId) return;
        try {
          await patchSessionPosition(sessionId, {
            positionMs: payload.positionMs,
            playing: payload.playing,
            latitude: payload.latitude,
            longitude: payload.longitude,
            trackId: payload.trackId,
          });
        } catch {
          /* ignore */
        }
      },
    });

    return () => setSessionHostBridge(null);
  }, []);

  useEffect(() => {
    if (role !== "host" || !activeTrack) {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      return;
    }

    if (heartbeatRef.current) clearInterval(heartbeatRef.current);

    heartbeatRef.current = setInterval(() => {
      void (async () => {
        const isPrivateRoom = Boolean(
          useNearbySessionStore.getState().roomCode
        );
        const coords = isPrivateRoom ? null : await getCurrentCoordinates();
        const state = usePlayerStore.getState();
        if (!state.activeTrack) return;

        const progress = await TrackPlayer.getProgress();
        const payload = {
          positionMs: Math.round(progress.position * 1000),
          playing: state.isPlaying,
          trackId: state.activeTrack.id,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          repeatMode: state.repeatMode,
        };
        patchActiveSessionPlayback({
          playing: payload.playing,
          positionMs: payload.positionMs,
          trackId: payload.trackId,
        });
        sessionSocketService.emitHostHeartbeat(payload);
        const sessionId = useNearbySessionStore.getState().activeSession?.id;
        if (!sessionId) return;
        try {
          await patchSessionPosition(sessionId, {
            positionMs: payload.positionMs,
            playing: payload.playing,
            ...(coords
              ? {
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                }
              : {}),
            trackId: payload.trackId,
          });
        } catch {
          /* ignore */
        }
      })();
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [activeTrack?.id, role]);

  return { stopHosting };
}
