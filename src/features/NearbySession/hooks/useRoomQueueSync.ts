import { useEffect, useRef } from "react";
import { usePlayerStore } from "src/features/Player/store/playerStore";
import { sessionSocketService } from "../services/sessionSocket.service";
import { useNearbySessionStore } from "../store/nearbySessionStore";
import type { SessionQueueTrack } from "../types/session.types";
import { sessionQueueTrackToArtistSong } from "../types/session.types";
import {
  clearLastConsumedRoomQueueMeta,
  getLastConsumedRoomQueueMeta,
  isRoomAdvanceInFlight,
  isStaleConsumedQueueEcho,
} from "../utils/roomAdvanceLock";
import { syncRoomQueue } from "../utils/syncRoomQueue";

/**
 * Mirror the full server room-queue into the host local up-next (after current).
 * Server order is the source of truth — do not skip when head matches activeTrack
 * (that left stale heads stuck in the room UI while local play-next drifted).
 */
export function ensureHostRoomPlayNext(
  queue: SessionQueueTrack[],
  lastAppliedFingerprint?: { current: string | null }
) {
  if (isRoomAdvanceInFlight()) return;
  if (useNearbySessionStore.getState().role !== "host") return;

  const fingerprint = queue.map((item) => item.queueItemId).join("|");
  if (
    lastAppliedFingerprint &&
    lastAppliedFingerprint.current === fingerprint
  ) {
    return;
  }

  const activeId = usePlayerStore.getState().activeTrack?.id;
  const upcoming = queue
    .filter((item) => item.songId && item.songId !== activeId)
    .map(sessionQueueTrackToArtistSong);

  usePlayerStore.getState().replaceUpcomingWithSongs(upcoming);

  if (lastAppliedFingerprint) {
    lastAppliedFingerprint.current = fingerprint;
  }
}

export function useRoomQueueSync() {
  const role = useNearbySessionStore((s) => s.role);
  const isConnected = useNearbySessionStore((s) => s.isConnected);
  const lastAppliedFingerprintRef = useRef<string | null>(null);

  useEffect(() => {
    if (role !== "host" && role !== "listener") {
      lastAppliedFingerprintRef.current = null;
      return;
    }
    // Wait until the socket exists — createRoom sets role before connect.
    if (!isConnected) return;

    const onQueueUpdated = (payload: { queue?: SessionQueueTrack[] }) => {
      let queue = Array.isArray(payload?.queue) ? payload.queue : [];

      // Optimistic local consume may race the server echo — ignore pure echoes
      // and slice a still-present consumed head once new items arrive behind it.
      if (isStaleConsumedQueueEcho(queue)) {
        return;
      }
      const { queueItemId: consumedId } = getLastConsumedRoomQueueMeta();
      if (consumedId && queue[0]?.queueItemId === consumedId) {
        queue = queue.slice(1);
      } else if (
        consumedId &&
        !queue.some((item) => item.queueItemId === consumedId)
      ) {
        clearLastConsumedRoomQueueMeta();
      }

      syncRoomQueue(queue);
      if (useNearbySessionStore.getState().role === "host") {
        ensureHostRoomPlayNext(queue, lastAppliedFingerprintRef);
      }
    };

    sessionSocketService.on("session:queueUpdated", onQueueUpdated);
    return () => {
      sessionSocketService.off("session:queueUpdated", onQueueUpdated);
    };
  }, [role, isConnected]);

  // One-shot sync when becoming host with an existing snapshot.
  useEffect(() => {
    if (role !== "host") {
      lastAppliedFingerprintRef.current = null;
      return;
    }
    const queue = useNearbySessionStore.getState().roomQueue;
    ensureHostRoomPlayNext(queue, lastAppliedFingerprintRef);
  }, [role]);
}
