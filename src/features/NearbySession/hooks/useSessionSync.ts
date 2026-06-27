import { useCallback, useEffect } from "react";
import { useRouter } from "expo-router";
import { appToast } from "src/components/toast/appToastHelpers";
import { usePlayback } from "src/features/Player/context/PlayerContext";
import { sessionSocketService } from "../services/sessionSocket.service";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import type { NearbySession } from "../types/session.types";
import {
  applyRemoteHeartbeat,
  applyRemotePause,
  applyRemotePlay,
  applyRemoteSeek,
  applyRemoteTrackChange,
} from "../utils/sessionSyncApplier";

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

      await applyRemoteTrackChange({
        trackId: session.trackId,
        trackTitle: session.trackTitle,
        trackArtist: session.trackArtist,
        trackArtwork: session.trackArtwork,
        trackUri: session.trackUri,
        trackDuration: session.trackDuration,
        positionMs: session.positionMs,
        playing: session.playing,
      });

      return true;
    },
    []
  );

  const { stopPlaybackAndClear } = usePlayback();
  const role = useNearbySessionStore((s) => s.role);

  const leaveSession = useCallback(async () => {
    sessionSocketService.leaveAsListener();
    useNearbySessionStore.getState().resetSession();
    await stopPlaybackAndClear();
  }, [stopPlaybackAndClear]);

  useEffect(() => {
    if (role !== "listener") return;

    const onTrackChange = (payload: Parameters<typeof applyRemoteTrackChange>[0]) => {
      void applyRemoteTrackChange(payload);
    };
    const onPlay = (payload: { positionMs: number; sentAt?: number }) => {
      void applyRemotePlay(payload.positionMs, payload.sentAt);
    };
    const onPause = (payload: { positionMs: number }) => {
      void applyRemotePause(payload.positionMs);
    };
    const onSeek = (payload: { positionMs: number; sentAt?: number }) => {
      void applyRemoteSeek(payload.positionMs, payload.sentAt);
    };
    const onHeartbeat = (payload: Parameters<typeof applyRemoteHeartbeat>[0]) => {
      void applyRemoteHeartbeat(payload);
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
    sessionSocketService.on("session:ended", onEnded);

    return () => {
      sessionSocketService.off("session:trackChange", onTrackChange);
      sessionSocketService.off("session:play", onPlay);
      sessionSocketService.off("session:pause", onPause);
      sessionSocketService.off("session:seek", onSeek);
      sessionSocketService.off("session:heartbeat", onHeartbeat);
      sessionSocketService.off("session:ended", onEnded);
    };
  }, [leaveSession, role, router]);

  return { joinSession, leaveSession };
}
