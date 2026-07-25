import { useCallback } from "react";
import TrackPlayer from "react-native-track-player";
import { appToast } from "src/components/toast/appToastHelpers";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import {
  createPrivateRoom,
  stopHostSession,
} from "../services/session.service";
import { sessionSocketService } from "../services/sessionSocket.service";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import type { SessionListener } from "../types/session.types";

function applyListenersUpdate(payload: {
  listenerCount?: number;
  listeners?: SessionListener[];
}) {
  if (Array.isArray(payload.listeners)) {
    useNearbySessionStore.getState().setRoomListeners(payload.listeners);
    useNearbySessionStore
      .getState()
      .setListenerCount(payload.listeners.length);
    return;
  }
  if (payload.listenerCount !== undefined) {
    useNearbySessionStore
      .getState()
      .setListenerCount(Math.max(0, Number(payload.listenerCount)));
  }
}

async function connectAndStartHost(sessionId: string) {
  const socket = sessionSocketService.connect();
  if (!socket) {
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

  socket.off("session:listenerCount");
  socket.off("session:listeners");
  socket.on("session:listenerCount", (event: { listenerCount: number }) => {
    useNearbySessionStore
      .getState()
      .setListenerCount(event.listenerCount ?? 0);
  });
  socket.on(
    "session:listeners",
    (event: { listenerCount?: number; listeners?: SessionListener[] }) => {
      applyListenersUpdate(event);
    }
  );

  const result = await sessionSocketService.emitHostStart(sessionId);
  if (!result.ok) {
    return false;
  }

  if (Array.isArray(result.queue)) {
    useNearbySessionStore.getState().setRoomQueue(result.queue);
  }

  useNearbySessionStore.getState().setIsConnected(true);
  return true;
}

export function usePrivateRoomHost() {
  const { isAuthenticated } = useAuth();

  const stopRoom = useCallback(async () => {
    const sessionId = useNearbySessionStore.getState().activeSession?.id;
    const isPrivateHost =
      useNearbySessionStore.getState().role === "host" &&
      Boolean(useNearbySessionStore.getState().roomCode);

    if (!isPrivateHost) {
      useNearbySessionStore.getState().resetSession();
      return;
    }

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

  const createRoom = useCallback(async () => {
    if (!isAuthenticated) {
      appToast.error("Sign in required to create a room");
      return null;
    }

    if (useNearbySessionStore.getState().role === "listener") {
      appToast.error("Leave your current session before creating a room");
      return null;
    }

    const state = usePlayerStore.getState();
    const track = state.activeTrack;

    let positionMs = state.positionMillis;
    if (track) {
      try {
        const progress = await TrackPlayer.getProgress();
        positionMs = Math.round(progress.position * 1000);
      } catch {
        /* use store position */
      }
    }

    try {
      const session = await createPrivateRoom(
        track
          ? {
              trackId: track.id,
              trackTitle: track.title,
              trackArtist: track.artist,
              trackArtwork: track.artworkUrl,
              trackUri: track.uri,
              trackDuration:
                track.durationSec > 0
                  ? track.durationSec * 1000
                  : positionMs,
              playing: state.isPlaying,
              positionMs,
            }
          : {
              playing: false,
              positionMs: 0,
            }
      );

      useNearbySessionStore.getState().setActiveSession(session);
      useNearbySessionStore
        .getState()
        .setRoomCode(session.roomCode ?? null);
      useNearbySessionStore.getState().setHostName(session.hostName);
      useNearbySessionStore.getState().setListenerCount(session.listenerCount);
      useNearbySessionStore
        .getState()
        .setRoomListeners(session.listeners ?? []);
      useNearbySessionStore
        .getState()
        .setRoomQueue(session.queue ?? []);
      useNearbySessionStore.getState().setRole("host");

      const started = await connectAndStartHost(session.id);
      if (!started) {
        appToast.error("Could not start room sync");
        return session;
      }

      return session;
    } catch {
      appToast.error("Could not create room");
      return null;
    }
  }, [isAuthenticated]);

  return { createRoom, stopRoom };
}
