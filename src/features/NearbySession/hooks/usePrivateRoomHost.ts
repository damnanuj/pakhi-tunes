import { useCallback, useEffect } from "react";
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
  socket.on("session:listenerCount", (event: { listenerCount: number }) => {
    useNearbySessionStore
      .getState()
      .setListenerCount(event.listenerCount ?? 0);
  });

  const result = await sessionSocketService.emitHostStart(sessionId);
  if (!result.ok) {
    return false;
  }

  useNearbySessionStore.getState().setIsConnected(true);
  return true;
}

export function usePrivateRoomHost() {
  const { isAuthenticated } = useAuth();
  const activeTrack = usePlayerStore((s) => s.activeTrack);
  const role = useNearbySessionStore((s) => s.role);
  const roomCode = useNearbySessionStore((s) => s.roomCode);

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

  // End private room when host clears playback (any path)
  useEffect(() => {
    if (role !== "host" || !roomCode) return;
    if (activeTrack) return;
    void stopRoom();
  }, [activeTrack, role, roomCode, stopRoom]);

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
    if (!track) {
      appToast.error("Play a song first to create a room");
      return null;
    }

    let positionMs = state.positionMillis;
    try {
      const progress = await TrackPlayer.getProgress();
      positionMs = Math.round(progress.position * 1000);
    } catch {
      /* use store position */
    }

    try {
      const session = await createPrivateRoom({
        trackId: track.id,
        trackTitle: track.title,
        trackArtist: track.artist,
        trackArtwork: track.artworkUrl,
        trackUri: track.uri,
        trackDuration:
          track.durationSec > 0 ? track.durationSec * 1000 : positionMs,
        playing: state.isPlaying,
        positionMs,
      });

      useNearbySessionStore.getState().setActiveSession(session);
      useNearbySessionStore
        .getState()
        .setRoomCode(session.roomCode ?? null);
      useNearbySessionStore.getState().setHostName(session.hostName);
      useNearbySessionStore.getState().setListenerCount(session.listenerCount);
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
