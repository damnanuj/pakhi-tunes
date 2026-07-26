import { useCallback, useRef } from "react";
import TrackPlayer from "react-native-track-player";
import { appToast } from "src/components/toast/appToastHelpers";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import { createPrivateRoom } from "../services/session.service";
import { sessionSocketService } from "../services/sessionSocket.service";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import type { SessionListener } from "../types/session.types";
import { applyHostStartAck } from "../utils/applyHostStartAck";
import { applyListenersUpdate } from "../utils/applyListenersUpdate";
import { connectSessionSocketReady } from "../utils/connectSessionSocketReady";
import { endHostSession } from "../utils/endHostSession";

async function connectAndStartHost(
  sessionId: string,
  handlers: {
    onConnect: () => void;
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

  sessionSocketService.off("connect", handlers.onConnect);
  sessionSocketService.off("session:listenerCount", handlers.onListenerCount);
  sessionSocketService.off("session:listeners", handlers.onListeners);
  sessionSocketService.on("connect", handlers.onConnect);
  sessionSocketService.on("session:listenerCount", handlers.onListenerCount);
  sessionSocketService.on("session:listeners", handlers.onListeners);

  const result = await sessionSocketService.emitHostStart(sessionId);
  if (!result.ok) {
    return false;
  }

  applyHostStartAck(result);
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
  const onConnectRef = useRef(() => {
    const state = useNearbySessionStore.getState();
    const isPrivateHost =
      state.role === "host" && Boolean(state.roomCode);
    const sessionId = state.activeSession?.id;
    if (!isPrivateHost || !sessionId) return;

    void (async () => {
      const result = await sessionSocketService.emitHostStart(sessionId);
      if (!result.ok) return;
      applyHostStartAck(result);
      useNearbySessionStore.getState().setIsConnected(true);
    })();
  });

  const stopRoom = useCallback(async () => {
    const sessionId = useNearbySessionStore.getState().activeSession?.id;
    const isPrivateHost =
      useNearbySessionStore.getState().role === "host" &&
      Boolean(useNearbySessionStore.getState().roomCode);

    if (!isPrivateHost) {
      useNearbySessionStore.getState().resetSession();
      return;
    }

    try {
      if (sessionId) {
        await endHostSession(sessionId);
      }
    } finally {
      useNearbySessionStore.getState().resetSession();
    }
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
        onConnect: onConnectRef.current,
        onListenerCount: onListenerCountRef.current,
        onListeners: onListenersRef.current,
      });
      if (!started) {
        // Without a host socket the server never learns this socket owns the
        // room, so ending it later would silently strand listeners. Roll back
        // instead of handing back a half-live room.
        appToast.error("Could not start room sync");
        await endHostSession(session.id);
        useNearbySessionStore.getState().resetSession();
        return null;
      }

      return session;
    } catch {
      appToast.error("Could not create room");
      return null;
    }
  }, [isAuthenticated]);

  return { createRoom, stopRoom };
}
