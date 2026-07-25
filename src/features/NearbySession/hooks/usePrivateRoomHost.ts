import { useCallback, useRef } from "react";
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
import { applyListenersUpdate } from "../utils/applyListenersUpdate";
import { connectSessionSocketReady } from "../utils/connectSessionSocketReady";
import { syncRoomQueue } from "../utils/syncRoomQueue";

async function connectAndStartHost(
  sessionId: string,
  handlers: {
    onListenerCount: (event: { listenerCount: number }) => void;
    onListeners: (event: {
      listenerCount?: number;
      listeners?: SessionListener[];
    }) => void;
  }
) {
  const socket = await connectSessionSocketReady();
  if (!socket) {
    return false;
  }

  socket.off("session:listenerCount", handlers.onListenerCount);
  socket.off("session:listeners", handlers.onListeners);
  socket.on("session:listenerCount", handlers.onListenerCount);
  socket.on("session:listeners", handlers.onListeners);

  const result = await sessionSocketService.emitHostStart(sessionId);
  if (!result.ok) {
    return false;
  }

  if (Array.isArray(result.queue)) {
    syncRoomQueue(result.queue);
  }

  useNearbySessionStore.getState().setIsConnected(true);
  return true;
}

export function usePrivateRoomHost() {
  const { isAuthenticated } = useAuth();
  const onListenerCountRef = useRef((event: { listenerCount: number }) => {
    applyListenersUpdate(event);
  });
  const onListenersRef = useRef(
    (event: { listenerCount?: number; listeners?: SessionListener[] }) => {
      applyListenersUpdate(event);
    }
  );

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

      useNearbySessionStore.setState({
        activeSession: session,
        roomCode: session.roomCode ?? null,
        hostName: session.hostName,
        listenerCount: session.listenerCount,
        roomListeners: session.listeners ?? [],
        roomQueue: session.queue ?? [],
        role: "host",
      });

      const started = await connectAndStartHost(session.id, {
        onListenerCount: onListenerCountRef.current,
        onListeners: onListenersRef.current,
      });
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
